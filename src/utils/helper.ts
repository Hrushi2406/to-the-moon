export function formatAddress(address: string) {
  return address.length == 0
    ? ""
    : address.substring(0, 4) + "...." + address.slice(-4);
}
