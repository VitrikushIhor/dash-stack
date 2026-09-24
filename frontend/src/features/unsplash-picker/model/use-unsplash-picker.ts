import React from 'react'

export const QUICK_SEARCHES = [
  'Education',
  'Books',
  'Nature',
  'Technology',
  'Travel',
  'Business',
  'Food',
  'Art',
]

export function useUnsplashPicker(
  open: boolean,
  initialQuery: string,
  onOpenChange: (open: boolean) => void,
  onSelectImage: (imageUrl: string) => void
) {
  const [searchQuery, setSearchQuery] = React.useState(initialQuery || '')
  const [activeQuery, setActiveQuery] = React.useState(
    initialQuery || 'learning'
  )

  const prevOpenRef = React.useRef(open)

  React.useEffect(() => {
    if (open && !prevOpenRef.current && initialQuery) {
      setSearchQuery(initialQuery)
      setActiveQuery(initialQuery)
    }
    prevOpenRef.current = open
  }, [open, initialQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim())
    }
  }

  const handleQuickSearch = (keyword: string) => {
    setSearchQuery(keyword)
    setActiveQuery(keyword)
  }

  const handleSelect = (imageUrl: string) => {
    onSelectImage(imageUrl)
    onOpenChange(false)
  }

  return {
    searchQuery,
    setSearchQuery,
    activeQuery,
    handleSearchSubmit,
    handleQuickSearch,
    handleSelect,
  }
}
