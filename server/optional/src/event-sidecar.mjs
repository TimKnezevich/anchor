export class EventSidecar {
  constructor() {
    this.repoSeqByRepo = new Map();
    this.outbox = [];
  }

  nextRepoSeq(repoId) {
    const current = this.repoSeqByRepo.get(repoId) ?? 0;
    const next = current + 1;
    this.repoSeqByRepo.set(repoId, next);
    return next;
  }

  publishSnapshot(repoId, eventType, payload) {
    const event = {
      repo_id: repoId,
      repo_seq: this.nextRepoSeq(repoId),
      event_type: eventType,
      payload,
      delivered: false
    };

    this.outbox.push(event);
    return event;
  }

  listOutbox(repoId = null) {
    if (repoId) {
      return this.outbox.filter((item) => item.repo_id === repoId).map((item) => ({ ...item }));
    }

    return this.outbox.map((item) => ({ ...item }));
  }

  markDelivered(repoId, repoSeq) {
    for (const item of this.outbox) {
      if (item.repo_id === repoId && item.repo_seq === repoSeq) {
        item.delivered = true;
      }
    }
  }
}
