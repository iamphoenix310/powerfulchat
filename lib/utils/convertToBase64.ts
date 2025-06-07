// lib/utils/convertToBase64.ts
export const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
  const promises = files.map((file) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1]) // removes data: prefix
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  })
  return Promise.all(promises)
}
