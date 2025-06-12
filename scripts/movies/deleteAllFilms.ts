import { client } from '@/app/utils/sanityClient'

async function deleteAllFilms() {
  const films = await client.fetch(`*[_type == "films"]{ _id }`)
  if (!films.length) {
    console.log('✅ No films to delete.')
    return
  }

  const ids = films.map((f: any) => f._id)
  console.log(`🗑 Deleting ${ids.length} film(s)...`)

  const mutations = ids.map((id: any) => ({ delete: { id } }))
  await client.transaction(mutations).commit()

  console.log('✅ All films deleted.')
}

deleteAllFilms().catch((err) => {
  console.error('❌ Error deleting films:', err)
})
