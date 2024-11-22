import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className='relative h-full w-full flex items-center justify-center'>
      <Link 
        href="/home"
        className='px-2 py-3 rounded border-[2px] border-black bg-white'
      >
        Opps! You ventured to the outer worlds, go back!
      </Link>
    </div>
  )
}