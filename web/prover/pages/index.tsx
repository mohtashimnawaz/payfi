import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/prover')
  }, [router])
  
  return (
    <main style={{padding: 24}}>
      <h1>Redirecting to prover...</h1>
    </main>
  )
}
