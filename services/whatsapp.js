async function sendWhatsAppMessage(phoneNumber, text) {
  console.log("Enviaria WhatsApp para", phoneNumber, "=>", text);
  // TODO: integrar com WhatsApp Cloud API oficial
}

module.exports = { sendWhatsAppMessage };
