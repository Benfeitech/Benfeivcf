import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);


// Save new session
async function saveSession(sessionName, whatsappLink, expiresIn) {
  const expiresAt = new Date(Date.now() + expiresIn * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from("sessions")
    .insert([{ sessionName, whatsappLink, expiresAt, contacts: [] }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Get session by id
async function getSession(id) {
  const { data, error } = await supabase.from("sessions").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

// Upload contact
async function uploadContact(sessionId, name, phone) {
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (error) return { success: false, error: "Session not found" };

  if (session.contacts.find((c) => c.phone === phone)) {
    return { success: false, error: "Contact already exists" };
  }

  const updatedContacts = [...session.contacts, { name, phone }];
  const { error: updateError } = await supabase
    .from("sessions")
    .update({ contacts: updatedContacts })
    .eq("id", sessionId);

  if (updateError) return { success: false, error: updateError.message };
  return { success: true };
}

// Generate VCF string
async function generateVCF(sessionId) {
  const session = await getSession(sessionId);
  let vcf = "";
  for (let c of session.contacts) {
    vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL:${c.phone}\nEND:VCARD\n\n`;
  }
  return vcf;
}

module.exports = { saveSession, getSession, uploadContact, generateVCF };
      
