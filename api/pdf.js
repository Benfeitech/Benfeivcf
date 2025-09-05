// api/pdf.js
import { supabaseAdmin } from "../lib/supabaseServer.js";
import PDFDocument from "pdfkit";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("contacts")
      .select("name, phone");

    if (error) throw error;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=contacts.pdf");

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(20).text("Contacts List", { align: "center" });
    doc.moveDown();

    data.forEach((c, i) => {
      doc.fontSize(14).text(`${i + 1}. ${c.name} — ${c.phone}`);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
