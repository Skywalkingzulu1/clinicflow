const supabase = require('../config/supabase');

/**
 * Fetch all verified and online doctors from the database
 */
async function getAvailableDoctors() {
  const { data, error } = await supabase
    .from('Doctors')
    .select('*')
    .eq('is_available', true)
    .eq('is_online', true)
    .in('verification_status', ['verified', 'basic']);

  if (error) {
    console.error('Error fetching available doctors:', error);
    throw error;
  }
  return data || [];
}

/**
 * Get a user's profile by email
 */
async function getProfileByEmail(email) {
  const { data, error } = await supabase
    .from('Profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching profile by email:', error);
    throw error;
  }
  return data;
}

/**
 * Create a new user profile on-the-fly if it doesn't exist
 */
async function createProfile(email, name, role = 'PATIENT') {
  // Query max ID to avoid duplicate key violations
  const { data: maxIdData } = await supabase
    .from('Profiles')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);

  const nextId = (maxIdData && maxIdData.length > 0) ? (Number(maxIdData[0].id) + 1) : 1;

  const { data, error } = await supabase
    .from('Profiles')
    .insert({
      id: nextId,
      email,
      name,
      role,
      credits: 500 // Start with default demo credits
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
  return data;
}

/**
 * Book an appointment in the database
 */
async function bookAppointment({ patientId, doctorId, reason, appointmentType = 'VIDEO', priceCredits = 650 }) {
  const { data: maxIdData } = await supabase
    .from('appointments')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);

  const nextId = (maxIdData && maxIdData.length > 0) ? (Number(maxIdData[0].id) + 1) : 1;

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      id: nextId,
      patient_id: patientId,
      doctor_id: doctorId,
      timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Book for tomorrow
      appointment_type: appointmentType,
      status: 'SCHEDULED',
      reason,
      price_credits: priceCredits,
      teleconsultation_status: 'pending',
      service_tier: 'VIDEO_CALL',
      escrow_status: 'NONE',
      payment_method: 'credits'
    })
    .select()
    .single();

  if (error) {
    console.error('Error booking appointment:', error);
    throw error;
  }
  return data;
}

module.exports = {
  getAvailableDoctors,
  getProfileByEmail,
  createProfile,
  bookAppointment
};
