export function formatAddress(address: string) {
  return address.length == 0
    ? ""
    : address.substring(0, 4) + "...." + address.slice(-4);
}

export function scrollToGame(ref: React.RefObject<HTMLDivElement>) {
  if (ref && ref.current) {
    window.scrollTo({
      behavior: "smooth",
      top: ref.current.offsetTop - 20,
    });
  }
}
