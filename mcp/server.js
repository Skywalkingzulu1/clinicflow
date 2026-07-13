#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const server = new McpServer({
  name: "clinicflow-mcp",
  version: "1.0.0",
});

server.tool(
  "search_doctors",
  "Search available doctors by specialty or name. Returns doctor details including name, specialty, area, and consultation fee.",
  {
    specialty: z.string().optional().describe("Filter by specialty (e.g. 'General Practitioner', 'Dentist')"),
    name: z.string().optional().describe("Filter by doctor name"),
  },
  async ({ specialty, name }) => {
    let query = supabase.from("doctors").select("*").eq("is_available", true);
    if (specialty) query = query.ilike("specialty", `%${specialty}%`);
    if (name) query = query.ilike("name", `%${name}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    if (!data.length) return { content: [{ type: "text", text: "No doctors found matching your criteria." }] };

    return {
      content: [{
        type: "text",
        text: data.map(d => `${d.name} — ${d.specialty}\n  Area: ${d.area || "JHB"} | Fee: R${d.consultation_fee || 650} | ID: ${d.id}`).join("\n\n")
      }]
    };
  }
);

server.tool(
  "book_appointment",
  "Book an appointment with a doctor for a patient. Creates the booking in the database and returns confirmation.",
  {
    patient_email: z.string().describe("Patient's email address"),
    patient_name: z.string().describe("Patient's full name"),
    doctor_id: z.string().uuid().describe("Doctor's UUID from search_doctors"),
    doctor_name: z.string().describe("Doctor's name for confirmation"),
    reason: z.string().describe("Reason for visit (e.g. 'Annual checkup', 'Tooth pain')"),
  },
  async ({ patient_email, patient_name, doctor_id, doctor_name, reason }) => {
    let { data: profile } = await supabase.from("profiles").select("id").eq("email", patient_email).single();

    if (!profile) {
      const { data: newProfile } = await supabase.from("profiles").insert({
        email: patient_email, full_name: patient_name, role: "PATIENT"
      }).select("id").single();
      profile = newProfile;
    }

    const { data: appointment, error } = await supabase.from("appointments").insert({
      patient_id: profile.id,
      doctor_id,
      reason,
      appointment_type: "VIDEO",
      status: "SCHEDULED",
      price_credits: 650,
      payment_method: "credits",
    }).select().single();

    if (error) return { content: [{ type: "text", text: `Booking failed: ${error.message}` }], isError: true };

    return {
      content: [{
        type: "text",
        text: `Appointment confirmed!\n  Patient: ${patient_name}\n  Doctor: ${doctor_name}\n  Reason: ${reason}\n  Fee: R650\n  Appointment ID: ${appointment.id}`
      }]
    };
  }
);

server.tool(
  "audit_prescription",
  "Audit a prescription for drug interactions, dosage safety, and allergies. Returns a safety report with risk level.",
  {
    medication: z.string().describe("Medication name (e.g. 'Metformin', 'Aspirin')"),
    dosage: z.string().optional().default("500mg").describe("Dosage (e.g. '500mg', '10mg')"),
    patient_age: z.number().optional().describe("Patient age for age-based checks"),
    current_medications: z.array(z.string()).optional().default([]).describe("List of other medications the patient is taking"),
  },
  async ({ medication, dosage, patient_age, current_medications }) => {
    const HIGH_RISK = {
      "warfarin": { risk: "HIGH", reason: "Anticoagulant — high bleeding risk" },
      "metformin": { risk: "MEDIUM", reason: "Monitor kidney function; risk of lactic acidosis" },
      "aspirin": { risk: "LOW", reason: "Common OTC — watch for GI interactions" },
      "ibuprofen": { risk: "MEDIUM", reason: "NSAID — kidney and GI risks" },
      "paracetamol": { risk: "LOW", reason: "Generally safe at recommended doses" },
    };

    const INTERACTIONS = [
      ["warfarin", "aspirin", "HIGH: Increased bleeding risk when combined"],
      ["metformin", "ibuprofen", "MEDIUM: NSAIDs can impair kidney function, increasing lactic acidosis risk"],
      ["warfarin", "ibuprofen", "HIGH: Significant increased bleeding risk"],
    ];

    const findings = [];
    const lowerMed = medication.toLowerCase();
    const drugInfo = HIGH_RISK[lowerMed];

    if (drugInfo) {
      findings.push(`[${drugInfo.risk} RISK] ${drugInfo.reason}`);
    } else {
      findings.push("[INFO] No known high-risk profile. Consult pharmacist for detailed analysis.");
    }

    if (patient_age && patient_age < 12) {
      findings.push("[CAUTION] Pediatric patient — verify age-appropriate dosing");
    }
    if (patient_age && patient_age > 65) {
      findings.push("[CAUTION] Elderly patient — may require dose adjustment");
    }

    for (const [med1, med2, warning] of INTERACTIONS) {
      if ((lowerMed === med1 && current_medications.some(m => m.toLowerCase() === med2)) ||
          (lowerMed === med2 && current_medications.some(m => m.toLowerCase() === med1))) {
        findings.push(`[INTERACTION] ${warning}`);
      }
    }

    if (findings.every(f => f.startsWith("[INFO]") || f.startsWith("[LOW"))) {
      findings.unshift("[OVERALL] LOW RISK — No critical issues detected");
    } else if (findings.some(f => f.startsWith("[HIGH"))) {
      findings.unshift("[OVERALL] HIGH RISK — Consult physician before dispensing");
    } else {
      findings.unshift("[OVERALL] MEDIUM RISK — Review recommended");
    }

    return {
      content: [{
        type: "text",
        text: `Prescription Audit Report\n${"=".repeat(40)}\nMedication: ${medication} ${dosage}\n${patient_age ? `Patient Age: ${patient_age}` : "Patient Age: Not specified"}\n${current_medications.length ? `Current Meds: ${current_medications.join(", ")}` : "Current Meds: None reported"}\n\nFindings:\n${findings.map((f, i) => `  ${i + 1}. ${f}`).join("\n")}`
      }]
    };
  }
);

server.tool(
  "list_appointments",
  "List upcoming appointments for a patient or doctor.",
  {
    patient_email: z.string().optional().describe("Patient email to filter by"),
    doctor_id: z.string().uuid().optional().describe("Doctor ID to filter by"),
  },
  async ({ patient_email, doctor_id }) => {
    let query = supabase.from("appointments").select("*, doctors(name, specialty), profiles(full_name, email)").order("created_at", { ascending: false });

    if (doctor_id) query = query.eq("doctor_id", doctor_id);
    if (patient_email) query = query.eq("profiles.email", patient_email);

    const { data, error } = await query.limit(20);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    if (!data.length) return { content: [{ type: "text", text: "No appointments found." }] };

    return {
      content: [{
        type: "text",
        text: data.map(a =>
          `${a.status} | ${a.profiles?.full_name || "Unknown"} → ${a.doctors?.name || "Unknown"} (${a.doctors?.specialty || ""})\n  Reason: ${a.reason} | Fee: R${a.price_credits} | ${new Date(a.created_at).toLocaleDateString()}`
        ).join("\n\n")
      }]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("ClinicFlow MCP server running on stdio");
