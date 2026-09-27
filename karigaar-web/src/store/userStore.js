import { create } from 'zustand'
import {
  getStoredUser,
  setStoredUser,
  getArtisanProfile,
  setArtisanProfile,
  getBuyerProfile,
  setBuyerProfile,
  DEMO_ARTISAN,
  DEMO_BUYER
} from '../config/auth'

export const useUserStore = create((set, get) => {
  const initialUser = getStoredUser() || getArtisanProfile()
  return {
    user: initialUser,
    role: initialUser?.role === 'buyer' ? 'buyer' : 'artisan',

    setUser: (newUser) => {
      setStoredUser(newUser)
      set({
        user: newUser,
        role: newUser?.role === 'buyer' ? 'buyer' : 'artisan'
      })
    },

    updateProfile: (updatedFields) => {
      const current = get().user || (get().role === 'buyer' ? getBuyerProfile() : getArtisanProfile())
      const isBuyer = current?.role === 'buyer'
      let updated
      if (isBuyer) {
        updated = setBuyerProfile({ ...current, ...updatedFields })
      } else {
        updated = setArtisanProfile({ ...current, ...updatedFields })
      }
      set({ user: updated, role: isBuyer ? 'buyer' : 'artisan' })
      return updated
    },

    switchToArtisan: () => {
      const artisanUser = getArtisanProfile()
      setStoredUser(artisanUser)
      set({ user: artisanUser, role: 'artisan' })
      window.dispatchEvent(new Event('karigaar_user_changed'))
    },

    switchToBuyer: () => {
      const buyerUser = getBuyerProfile()
      setStoredUser(buyerUser)
      set({ user: buyerUser, role: 'buyer' })
      window.dispatchEvent(new Event('karigaar_user_changed'))
    },

    logout: () => {
      setStoredUser(null)
      set({ user: null, role: 'artisan' })
      window.dispatchEvent(new Event('karigaar_user_changed'))
    },
  }
})
