function createNotification(input) {
  return { id: `ntf_${Date.now()}`, status: 'queued', createdAt: new Date().toISOString(), ...input };
}

module.exports = { createNotification };
