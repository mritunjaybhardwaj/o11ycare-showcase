const stages = [
  ['THE ORIGIN', 'It starts with an ordinary application log.', 'Applications write to stdout or stderr. Kubernetes captures those records in container log files on the node; the application does not need to call the dispatcher directly.'],
  ['ONE AGENT PER NODE', 'Collect where the logs actually live.', 'A Vector DaemonSet tails node-local container logs and forwards them to the aggregator. Its current buffer uses emptyDir: replacing the agent pod loses that buffer and its checkpoints.'],
  ['BUFFER BEFORE FORWARDING', 'Give temporary outages somewhere to wait.', 'A Vector StatefulSet receives records and uses a PVC-backed disk buffer for its Loki sink. When its configured buffer fills, blocking propagates upstream. Storage capacity is finite.'],
  ['BOUNDED CONCURRENCY', 'One shared handler. Independent requests.', 'The Go dispatcher admits a bounded number of concurrent requests and forwards Loki-compatible payloads with a shared HTTP client and connection pool. It holds no durable log queue.'],
  ['DELIVERY AND DISCOVERY', 'Store in Loki. Explore in Grafana.', 'Loki accepts the forwarded records. Grafana provides the search experience. The recovery test queries Loki directly and compares individual sequence IDs rather than trusting a dashboard count.']
];
document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.stage);
  document.querySelectorAll('[data-stage]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  ['stage-tag', 'stage-title', 'stage-description'].forEach((id, position) => document.getElementById(id).textContent = stages[index][position]);
}));
const phases = [
  ['19:19:54 UTC', 'Establish the baseline.', 'One numbered log and its completion marker reach Loki. The pipeline works before the outage begins.', 'BASELINE passed\nunique=1 · marker=true'],
  ['19:19:56 UTC', 'Stop the dispatcher.', 'The runner scales the dispatcher to zero and confirms that no dispatcher pods remain before starting the generator.', 'SCALE_DOWN confirmed\nno dispatcher pods remain'],
  ['19:19:58–19:21:58 UTC', 'Generate during the outage.', 'A Kubernetes Job is started for 10,000 numbered records at a target of 100 per second. The runner holds the outage for two minutes after generator startup.', 'GENERATOR expected=10000\nOUTAGE duration=2m0s'],
  ['19:22:06 UTC', 'Bring delivery back.', 'The original replica count is restored. One dispatcher replica becomes ready. The first verification still finds zero records; delivery is not assumed to be instant.', 'RESTORE ready_replicas=1\nVERIFY unique=0 · missing=10000'],
  ['19:22:22 UTC', 'Verify every expected ID.', 'Loki contains all 10,000 unique sequence IDs and the completion marker. The generator completed, cleanup succeeded, and the dispatcher was left at one replica.', 'VERIFY unique=10000 · missing=0\nduplicates=0 · marker=true\nRESULT PASS']
];
let phase = 0;
function showPhase(index) {
  phase = Math.max(0, Math.min(phases.length - 1, index));
  ['replay-time', 'replay-title', 'replay-description', 'replay-code'].forEach((id, position) => document.getElementById(id).textContent = phases[phase][position]);
  document.getElementById('replay-code').style.whiteSpace = 'pre-line';
  document.getElementById('step-count').textContent = `0${phase + 1} / 05`;
  document.getElementById('replay-progress').style.width = `${(phase + 1) * 20}%`;
  document.getElementById('previous').disabled = phase === 0;
  document.getElementById('next').disabled = phase === phases.length - 1;
  document.querySelectorAll('[data-step]').forEach(button => { const active = Number(button.dataset.step) === phase; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active)); });
}
document.getElementById('previous').addEventListener('click', () => showPhase(phase - 1));
document.getElementById('next').addEventListener('click', () => showPhase(phase + 1));
document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => showPhase(Number(button.dataset.step))));
