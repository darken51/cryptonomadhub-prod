'use server'

import { cookies } from 'next/headers'
import { Locale } from './request'

const COOKIE_NAME = 'NEXT_LOCALE'

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = cookies()
  const locale = cookieStore.get(COOKIE_NAME)
  return (locale?.value as Locale) || 'en'
}

export async function setUserLocale(locale: Locale) {
  const cookieStore = cookies()
  cookieStore.set(COOKIE_NAME, locale, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: '/',
    sameSite: 'lax',
  })
}
