export async function uploadToR2(file: File): Promise<string> {
    const filename = `${Date.now()}-${encodeURIComponent(file.name)}`
  
    const res = await fetch(`/api/r2/upload?filename=${filename}`, {
      method: 'POST',
      body: file,
    })
  
    if (!res.ok) {
      throw new Error('Failed to upload to R2')
    }
  
    const data = await res.json()
    return data.url
  }
  