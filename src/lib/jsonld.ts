// JSON-LD'yi <script> içine XSS-güvenli bas. JSON.stringify `<`, `>`, `&`
// kaçırmadığından kullanıcı verisi (pin adı vb.) `</script>` enjekte edebilir.
// U+2028/2029 de JS string'i kırar.
export function jsonLdSafe(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
