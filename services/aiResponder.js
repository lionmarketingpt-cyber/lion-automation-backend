function generateReply(userText, brandConfig) {
  const txt = userText.toLowerCase();

  if (txt.includes("preço") || txt.includes("preco") || txt.includes("valor")) {
    return (
      "Trabalhamos com propostas personalizadas. " +
      "Posso pedir o teu nome e número de WhatsApp para a nossa equipa comercial responder já com valores?"
    );
  }

  if (txt.includes("onde") && (txt.includes("ficam") || txt.includes("local"))) {
    if (brandConfig?.address) {
      return `Atendemos em ${brandConfig.address}. Implementação 100% online.`;
    }
    return "Atendemos em Portugal. Implementação 100% online.";
  }

  if (txt.includes("horário") || txt.includes("horario") || txt.includes("hora")) {
    if (brandConfig?.schedule) {
      return `Estamos disponíveis ${brandConfig.schedule}.`;
    }
    return "Respondemos 24h/dia com assistente inteligente.";
  }

  if (txt.includes("serviço") || txt.includes("servicos") || txt.includes("serviços")) {
    if (brandConfig?.services) {
      return `Nós ajudamos com: ${brandConfig.services}`;
    }
    return "Nós ajudamos com automação de atendimento, captação de leads e gestão comercial.";
  }

  return (
    "Sou o assistente inteligente da Lion Automation 🦁 " +
    "Queres deixar o teu nome e número de WhatsApp para falarmos contigo hoje mesmo?"
  );
}

module.exports = { generateReply };
