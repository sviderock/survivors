export function parseJson(str: string) {
  try {
    return JSON.parse(str)
  } catch (error) {
    console.log('issue parsing JSON', error)
    return {}
  }
}