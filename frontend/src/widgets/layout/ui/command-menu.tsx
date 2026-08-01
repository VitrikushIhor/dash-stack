'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun } from 'lucide-react'
import { useSearch, useTheme } from '@/shared/lib/providers'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/ui/core/command'
import { ScrollArea } from '@/shared/ui/core/scroll-area'
import { sidebarData } from './data/sidebar-data'
import { type NavCollapsible, type NavLink } from './types'

export function CommandMenu() {
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>No results found.</CommandEmpty>
          {sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) =>
                navItem.url ? (
                  <CommandMenuNavItem
                    key={`${navItem.url}-${i}`}
                    item={navItem as NavLink}
                    onSelect={runCommand}
                  />
                ) : (
                  <CommandMenuSubItems
                    key={`${navItem.title}-${i}`}
                    item={navItem as NavCollapsible}
                    onSelect={runCommand}
                  />
                )
              )}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading='Theme'>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun /> <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className='scale-90' />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <Laptop />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}

function CommandMenuNavItem({
  item,
  onSelect,
}: {
  item: NavLink
  onSelect: (command: () => unknown) => void
}) {
  const router = useRouter()
  return (
    <CommandItem
      value={item.title}
      onSelect={() => {
        onSelect(() => router.push(item.url))
      }}
    >
      <div className='flex size-4 items-center justify-center'>
        <ArrowRight className='text-muted-foreground/80 size-2' />
      </div>
      {item.title}
    </CommandItem>
  )
}

function CommandMenuSubItems({
  item,
  onSelect,
}: {
  item: NavCollapsible
  onSelect: (command: () => unknown) => void
}) {
  const router = useRouter()
  return (
    <>
      {item.items.map((subItem, i) => (
        <CommandItem
          key={`${item.title}-${subItem.url}-${i}`}
          value={`${item.title}-${subItem.url}`}
          onSelect={() => {
            onSelect(() => router.push(subItem.url))
          }}
        >
          <div className='flex size-4 items-center justify-center'>
            <ArrowRight className='text-muted-foreground/80 size-2' />
          </div>
          {item.title} <ChevronRight className='mx-1 size-3' /> {subItem.title}
        </CommandItem>
      ))}
    </>
  )
}
