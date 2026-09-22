// Synthetic demonstration data only. No cluster connection or telemetry collection.
const records = [
  {time:'10:42:03', namespace:'checkout', pod:'orders-api-7c8f', level:'INFO', message:'Order request received order_id=123'},
  {time:'10:42:04', namespace:'checkout', pod:'payments-api-4d2a', level:'ERROR', message:'Payment timeout order_id=123 upstream=payment-provider'},
  {time:'10:42:05', namespace:'checkout', pod:'payments-api-4d2a', level:'INFO', message:'Retry scheduled order_id=123 attempt=2'},
  {time:'10:42:07', namespace:'inventory', pod:'stock-api-6b1e', level:'INFO', message:'Stock reserved order_id=456 item=keyboard'},
  {time:'10:42:09', namespace:'inventory', pod:'stock-api-6b1e', level:'WARN', message:'Low stock threshold reached item=monitor'},
  {time:'10:42:12', namespace:'checkout', pod:'payments-api-4d2a', level:'INFO', message:'Payment accepted order_id=123 attempt=2'}
];
const namespace = document.getElementById('namespace');
const query = document.getElementById('query');
function render() {
  const term = query.value.trim().toLowerCase();
  const found = records.filter(record => (namespace.value === 'all' || record.namespace === namespace.value) && record.message.toLowerCase().includes(term));
  const body = document.getElementById('log-results'); body.replaceChildren();
  for (const record of found) {
    const row = document.createElement('tr');
    for (const [index, value] of [record.time, record.namespace + ' / ' + record.pod, record.level, record.message].entries()) {
      const cell = document.createElement('td');
      if (index === 2) { const badge = document.createElement('span'); badge.className = 'level ' + record.level.toLowerCase(); badge.textContent = value; cell.append(badge); }
      else cell.textContent = value;
      row.append(cell);
    }
    body.append(row);
  }
  document.getElementById('result-count').textContent = found.length + ' matching ' + (found.length === 1 ? 'record' : 'records');
  document.getElementById('empty-state').hidden = found.length !== 0;
}
document.getElementById('search-form').addEventListener('submit', event => { event.preventDefault(); render(); });
namespace.addEventListener('change', render);
document.getElementById('reset').addEventListener('click', () => { namespace.value = 'all'; query.value = ''; render(); });
render();
