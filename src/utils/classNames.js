export function cx(...args) {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(' ')
}

export function cn(...args) {
  return cx(...args)
}