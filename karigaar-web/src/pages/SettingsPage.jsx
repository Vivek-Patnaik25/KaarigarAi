import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Storefront,
  Buildings,
  Phone,
  MapPin,
  Camera,
  CheckCircle,
  FloppyDisk,
  ArrowCounterClockwise,
  IdentificationBadge,
  Sparkle,
  Globe,
  Tag,
  Briefcase,
  ShieldCheck,
  ArrowsLeftRight,
  UploadSimple,
  Trash
} from '@phosphor-icons/react'

import Navbar from '../components/Navbar'
import ClayButton from '../components/ClayButton'
import { useUserStore } from '../store/userStore'
import {
  getArtisanProfile,
  setArtisanProfile,
  getBuyerProfile,
  setBuyerProfile,
  DEMO_ARTISAN,
  DEMO_BUYER
} from '../config/auth'
import { saveProfile, uploadAvatar } from '../config/api'

// Preset authentic avatar portraits for instant selection
const ARTISAN_AVATAR_PRESETS = [
  { label: 'Traditional Master Potter', url: '/artisan_avatar.png' },
  { label: 'Rajasthan Terracotta Artisan', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { label: 'Varanasi Master Weaver', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Odisha Dokra Craftsman', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Chikankari Artisan', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' }
]

const BUYER_AVATAR_PRESETS = [
  { label: 'Heritage Boutique Logo', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80' },
  { label: 'Curator Portrait', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { label: 'Retail Studio', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80' }
]

const CRAFT_OPTIONS = [
  { value: 'pottery_terracotta', label: 'Pottery & Terracotta (मिट्टी और टेराकोटा)' },
  { value: 'textile_handloom', label: 'Handloom & Silk Textiles (हथकरघा और रेशम)' },
  { value: 'metal_dokra', label: 'Dokra & Brass Metal Craft (ढोकरा और पीतल शिल्प)' },
  { value: 'woodcraft', label: 'Carved Woodcraft (काष्ठ कला)' },
  { value: 'painting_madhubani', label: 'Madhubani & Folk Art (मधुबनी और लोक कला)' },
  { value: 'embroidery_chikankari', label: 'Chikankari & Zardozi (चिकनकारी और ज़रदोज़ी)' },
  { value: 'blue_pottery', label: 'Jaipur Blue Pottery (जयपुर ब्लू पॉटरी)' }
]

const ALL_LANGUAGES = [
  'हिन्दी (Hindi)',
  'English',
  'मारवाड़ी (Marwari)',
  'বাংলা (Bengali)',
  'ଓଡ଼ିଆ (Odia)',
  'தமிழ் (Tamil)',
  'मराठी (Marathi)',
  'ગુજરાતી (Gujarati)'
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { role, user, updateProfile, switchToArtisan, switchToBuyer } = useUserStore()

  const requestedTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(requestedTab || (role === 'buyer' ? 'buyer' : 'artisan'))
  const [toastMessage, setToastMessage] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  // Artisan form state
  const [artisanForm, setArtisanForm] = useState(() => getArtisanProfile())
  
  // Buyer form state
  const [buyerForm, setBuyerForm] = useState(() => getBuyerProfile())

  useEffect(() => {
    setArtisanForm(getArtisanProfile())
    setBuyerForm(getBuyerProfile())
  }, [role])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle image upload from computer / mobile
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Quick base64 preview
    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target.result
      if (activeTab === 'artisan') {
        setArtisanForm(prev => ({ ...prev, avatarUrl: dataUrl }))
      } else {
        setBuyerForm(prev => ({ ...prev, avatarUrl: dataUrl }))
      }
    }
    reader.readAsDataURL(file)

    // Optional upload to backend
    try {
      const uploadRes = await uploadAvatar(file)
      const uploadedUrl = uploadRes?.url || uploadRes?.data?.url
      if (uploadedUrl) {
        if (activeTab === 'artisan') {
          setArtisanForm(prev => ({ ...prev, avatarUrl: uploadedUrl }))
        } else {
          setBuyerForm(prev => ({ ...prev, avatarUrl: uploadedUrl }))
        }
      }
    } catch (err) {
      console.warn('Image uploaded locally as DataURL:', err)
    }
  }

  const handleLanguageToggle = (lang) => {
    setArtisanForm(prev => {
      const current = Array.isArray(prev.languages) ? prev.languages : []
      if (current.includes(lang)) {
        return { ...prev, languages: current.filter(l => l !== lang) }
      } else {
        return { ...prev, languages: [...current, lang] }
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeTab === 'artisan') {
        setArtisanProfile(artisanForm)
        updateProfile(artisanForm)
        await saveProfile({
          role: 'artisan',
          user_id: artisanForm.artisanId,
          artisan_id: artisanForm.artisanId,
          name: artisanForm.name,
          name_regional: artisanForm.nameHi,
          phone: artisanForm.phone,
          avatar_url: artisanForm.avatarUrl,
          workshop_name: artisanForm.workshopName,
          craft: artisanForm.craft,
          craft_title: artisanForm.craftTitle,
          location: artisanForm.location,
          years_active: artisanForm.yearsActive,
          bio: artisanForm.bio,
          languages: artisanForm.languages,
        })
        showToast(t('settings.artisan_saved', 'Artisan Studio Profile saved successfully!'))
      } else {
        setBuyerProfile(buyerForm)
        updateProfile(buyerForm)
        await saveProfile({
          role: 'buyer',
          user_id: buyerForm.buyerId,
          buyer_id: buyerForm.buyerId,
          name: buyerForm.name,
          phone: buyerForm.phone,
          avatar_url: buyerForm.avatarUrl,
          buyer_name: buyerForm.buyerName,
          organization_name: buyerForm.organizationName,
          buyer_type: buyerForm.buyerType,
          title: buyerForm.title,
          location: buyerForm.location,
          interests: buyerForm.interests,
          gstin: buyerForm.gstin,
        })
        showToast(t('settings.buyer_saved', 'Buyer Organization Profile saved successfully!'))
      }
    } catch (err) {
      showToast(t('settings.saved_locally', 'Profile updated successfully.'))
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefaults = () => {
    if (activeTab === 'artisan') {
      setArtisanForm(DEMO_ARTISAN)
      setArtisanProfile(DEMO_ARTISAN)
      updateProfile(DEMO_ARTISAN)
      showToast(t('settings.reset_artisan', 'Artisan Profile reset to defaults.'))
    } else {
      setBuyerForm(DEMO_BUYER)
      setBuyerProfile(DEMO_BUYER)
      updateProfile(DEMO_BUYER)
      showToast(t('settings.reset_buyer', 'Buyer Profile reset to defaults.'))
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col pb-24 text-stone-900">
      <Navbar />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-8">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E8762B]">
              {t('settings.subtitle', 'Account & Profile Management')}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2E6B] tracking-tight mt-0.5">
              {t('settings.title', 'Profile Settings')}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t('settings.description', 'Customize your public profile, contact details, workshop story, and branding.')}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-xs text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors font-medium border border-stone-300 shadow-2xs"
            >
              <ArrowCounterClockwise size={14} />
              <span>{t('settings.reset', 'Reset Defaults')}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded text-xs text-white bg-[#E8762B] hover:bg-[#d66820] font-semibold transition-all shadow-sm active:scale-98"
              style={{ minHeight: '40px' }}
            >
              <FloppyDisk size={16} weight="bold" />
              <span>{saving ? t('settings.saving', 'Saving...') : t('settings.save_changes', 'Save Changes')}</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle: Artisan Studio vs Buyer Organization */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('artisan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'artisan'
                ? 'bg-[#1B2E6B] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Storefront size={16} weight={activeTab === 'artisan' ? 'fill' : 'regular'} />
            <span>{t('settings.artisan_tab', 'Artisan Studio Profile')}</span>
            {role === 'artisan' && (
              <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] bg-[#E8762B] text-white">Active</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('buyer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'buyer'
                ? 'bg-[#1B2E6B] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Buildings size={16} weight={activeTab === 'buyer' ? 'fill' : 'regular'} />
            <span>{t('settings.buyer_tab', 'Buyer & Procurement Profile')}</span>
            {role === 'buyer' && (
              <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] bg-[#E8762B] text-white">Active</span>
            )}
          </button>
        </div>

        {/* Form Grid with Live Preview on the side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Editing Column (2 cols on desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* 1. Avatar & Profile Picture Card */}
            <div className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#1B2E6B] flex items-center gap-2">
                    <Camera size={18} className="text-[#E8762B]" />
                    <span>{t('settings.profile_photo_title', 'Profile & Workshop Photo')}</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {t('settings.profile_photo_sub', 'This photo appears on your Digital Passport, proposal messages, and storefront.')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Current Avatar Frame */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-stone-300 bg-stone-100 shadow-xs">
                    <img
                      src={
                        (activeTab === 'artisan' ? artisanForm.avatarUrl : buyerForm.avatarUrl) ||
                        (activeTab === 'artisan' ? '/artisan_avatar.png' : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80')
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = activeTab === 'artisan' ? '/artisan_avatar.png' : '/favicon_new.png'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer text-xs"
                  >
                    <Camera size={20} />
                    <span className="text-[10px] font-medium mt-1">Change</span>
                  </button>
                </div>

                {/* Upload & Preset Options */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-white bg-[#E8762B] hover:bg-[#d66820] transition-colors shadow-2xs cursor-pointer"
                    >
                      <UploadSimple size={15} weight="bold" />
                      <span>{t('settings.upload_new_photo', 'Upload from Device')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'artisan') {
                          setArtisanForm(prev => ({ ...prev, avatarUrl: '/artisan_avatar.png' }))
                        } else {
                          setBuyerForm(prev => ({ ...prev, avatarUrl: '' }))
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-2 rounded text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors cursor-pointer"
                    >
                      <Trash size={14} />
                      <span>{t('settings.remove_photo', 'Reset Avatar')}</span>
                    </button>
                  </div>

                  {/* Preset Quick Selectors */}
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-stone-500 block mb-1.5">
                      {t('settings.choose_preset', 'Or pick from curated portraits:')}
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {(activeTab === 'artisan' ? ARTISAN_AVATAR_PRESETS : BUYER_AVATAR_PRESETS).map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (activeTab === 'artisan') {
                              setArtisanForm(prev => ({ ...prev, avatarUrl: p.url }))
                            } else {
                              setBuyerForm(prev => ({ ...prev, avatarUrl: p.url }))
                            }
                          }}
                          className="w-10 h-10 rounded-md overflow-hidden border border-stone-300 hover:border-[#E8762B] hover:scale-105 transition-all shrink-0 bg-stone-50"
                          title={p.label}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Form Fields: Artisan vs Buyer */}
            {activeTab === 'artisan' ? (
              <div className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs flex flex-col gap-5">
                <h2 className="text-sm font-bold text-[#1B2E6B] flex items-center gap-2 border-b border-stone-200 pb-3">
                  <Storefront size={18} className="text-[#E8762B]" />
                  <span>{t('settings.artisan_details_title', 'Artisan & Workshop Details')}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name English */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.full_name', 'Full Name (English)')} *
                    </label>
                    <input
                      type="text"
                      value={artisanForm.name || ''}
                      onChange={(e) => setArtisanForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                      placeholder="e.g. Rameshwar Prajapati"
                    />
                  </div>

                  {/* Name in Regional / Hindi */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.regional_name', 'Name in Regional Script (हिन्दी / Local)')}
                    </label>
                    <input
                      type="text"
                      value={artisanForm.nameHi || ''}
                      onChange={(e) => setArtisanForm(prev => ({ ...prev, nameHi: e.target.value }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                      placeholder="e.g. रामेश्वर प्रजापति"
                    />
                  </div>

                  {/* Phone Number for direct WhatsApp / Calls */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.phone_number', 'Direct Contact Phone (for WhatsApp & Orders)')} *
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={artisanForm.phone || ''}
                        onChange={(e) => setArtisanForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 rounded border border-stone-300 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                        placeholder="+919556828397"
                      />
                    </div>
                  </div>

                  {/* Workshop Name */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.workshop_name', 'Workshop / Studio Name')}
                    </label>
                    <input
                      type="text"
                      value={artisanForm.workshopName || ''}
                      onChange={(e) => setArtisanForm(prev => ({ ...prev, workshopName: e.target.value }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                      placeholder="e.g. Prajapati Terracotta Studio"
                    />
                  </div>

                  {/* Craft Category */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.craft_specialty', 'Primary Craft Tradition')} *
                    </label>
                    <select
                      value={artisanForm.craft || 'pottery_terracotta'}
                      onChange={(e) => {
                        const opt = CRAFT_OPTIONS.find(o => o.value === e.target.value)
                        setArtisanForm(prev => ({
                          ...prev,
                          craft: e.target.value,
                          craftTitle: opt ? opt.label.split('(')[0].trim() : 'Handicraft'
                        }))
                      }}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                    >
                      {CRAFT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Heritage Region / Location */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.location', 'Heritage Region / City & State')} *
                    </label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={artisanForm.location || ''}
                        onChange={(e) => setArtisanForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                        placeholder="e.g. Jaipur, Rajasthan"
                      />
                    </div>
                  </div>

                  {/* Years of Practice */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.years_active', 'Generational Practice / Years Active')}
                    </label>
                    <input
                      type="text"
                      value={artisanForm.yearsActive || ''}
                      onChange={(e) => setArtisanForm(prev => ({ ...prev, yearsActive: e.target.value }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                      placeholder="e.g. 18 years (4th generation)"
                    />
                  </div>

                  {/* Artisan ID / GI Tag Code */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.artisan_id', 'Government Artisan ID / GI Seal')}
                    </label>
                    <div className="relative">
                      <IdentificationBadge size={14} className="absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={artisanForm.artisanId || 'KG-2024-8921'}
                        onChange={(e) => setArtisanForm(prev => ({ ...prev, artisanId: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 rounded border border-stone-300 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                        placeholder="KG-2024-8921"
                      />
                    </div>
                  </div>

                  {/* Languages Spoken (interactive pills) */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                      {t('settings.languages_spoken', 'Languages Spoken with Buyers')}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_LANGUAGES.map(lang => {
                        const isSelected = (artisanForm.languages || []).includes(lang)
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => handleLanguageToggle(lang)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-[#1B2E6B] text-white'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
                            }`}
                          >
                            {lang}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bio / Heritage Story */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.workshop_story', 'Workshop Legacy & Craft Story')}
                    </label>
                    <textarea
                      rows={3}
                      value={artisanForm.bio || ''}
                      onChange={(e) => setArtisanForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                      placeholder="Share your craft tradition, firing techniques, raw materials used, and master heritage..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Buyer Form */
              <div className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs flex flex-col gap-5">
                <h2 className="text-sm font-bold text-[#1B2E6B] flex items-center gap-2 border-b border-stone-200 pb-3">
                  <Buildings size={18} className="text-[#E8762B]" />
                  <span>{t('settings.buyer_details_title', 'Buyer & Procurement Organization Details')}</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Contact Person Name */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.contact_person', 'Procurement Contact Name')} *
                    </label>
                    <input
                      type="text"
                      value={buyerForm.name || ''}
                      onChange={(e) => setBuyerForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                      placeholder="e.g. Ananya Sharma"
                    />
                  </div>

                  {/* Job Title / Role */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.job_title', 'Designation / Role')}
                    </label>
                    <input
                      type="text"
                      value={buyerForm.title || ''}
                      onChange={(e) => setBuyerForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                      placeholder="e.g. Co-Founder & Chief Curator"
                    />
                  </div>

                  {/* Business / Organization Name */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.organization_name', 'Retailer / Business Name')} *
                    </label>
                    <input
                      type="text"
                      value={buyerForm.buyerName || buyerForm.organizationName || ''}
                      onChange={(e) => setBuyerForm(prev => ({
                        ...prev,
                        buyerName: e.target.value,
                        organizationName: e.target.value
                      }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                      placeholder="e.g. Parampara Heritage Retail & Living"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.buyer_phone', 'Registered Phone Number')} *
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={buyerForm.phone || ''}
                        onChange={(e) => setBuyerForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 rounded border border-stone-300 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                        placeholder="+91 9876543211"
                      />
                    </div>
                  </div>

                  {/* Buyer Type */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.buyer_type', 'Business Classification')}
                    </label>
                    <select
                      value={buyerForm.buyerType || 'Premium Boutique & Retailer'}
                      onChange={(e) => setBuyerForm(prev => ({ ...prev, buyerType: e.target.value }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                    >
                      <option value="Premium Boutique & Retailer">Premium Boutique & Retailer</option>
                      <option value="National Department Store">National Department Store</option>
                      <option value="Handicraft Export House">Handicraft Export House</option>
                      <option value="Hospitality & Interior Designer">Hospitality & Interior Designer</option>
                      <option value="Direct Sourcing Collective">Direct Sourcing Collective</option>
                    </select>
                  </div>

                  {/* Commercial Location */}
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.hq_location', 'Headquarters / Sourcing Base')}
                    </label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={buyerForm.location || ''}
                        onChange={(e) => setBuyerForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                        placeholder="e.g. Kala Ghoda, Mumbai, Maharashtra"
                      />
                    </div>
                  </div>

                  {/* GSTIN / Trade Registration */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.gstin', 'GSTIN / Commercial Trade Registration')}
                    </label>
                    <input
                      type="text"
                      value={buyerForm.gstin || ''}
                      onChange={(e) => setBuyerForm(prev => ({ ...prev, gstin: e.target.value }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs font-mono text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                      placeholder="e.g. 27AABCP1234F1Z8"
                    />
                  </div>

                  {/* Sourcing Interests */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('settings.sourcing_interests', 'Sourcing Interests & Craft Requirements')}
                    </label>
                    <textarea
                      rows={3}
                      value={buyerForm.interests || ''}
                      onChange={(e) => setBuyerForm(prev => ({ ...prev, interests: e.target.value }))}
                      className="w-full px-3 py-2 rounded border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-[#1B2E6B] bg-stone-50/50"
                      placeholder="e.g. Handmade terracotta cookware, certified Banarasi handloom silks, blue pottery studio ware..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Live Preview Column */}
          <div className="flex flex-col gap-6">
            <div className="p-5 bg-white rounded-lg border border-stone-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8762B] block mb-2">
                {t('settings.live_preview', 'Live Public Preview')}
              </span>

              {activeTab === 'artisan' ? (
                /* Artisan Mini Passport Preview */
                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-stone-300 bg-stone-100 shrink-0">
                      <img
                        src={artisanForm.avatarUrl || '/artisan_avatar.png'}
                        alt={artisanForm.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/artisan_avatar.png'
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1B2E6B] truncate">
                          {artisanForm.name || 'Rameshwar Prajapati'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                          Verified
                        </span>
                      </div>
                      {artisanForm.nameHi && (
                        <p className="text-[11px] text-stone-500 font-medium">{artisanForm.nameHi}</p>
                      )}
                      <p className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#E8762B]" />
                        <span>{artisanForm.location || 'Jaipur, Rajasthan'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-2 flex flex-col gap-1 text-[11px]">
                    <div className="flex justify-between text-stone-600">
                      <span>Craft:</span>
                      <span className="font-semibold text-stone-900">{artisanForm.craftTitle || 'Terracotta & Pottery'}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Phone:</span>
                      <span className="font-mono font-semibold text-emerald-800">{artisanForm.phone || '+91 9556828397'}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Experience:</span>
                      <span className="font-semibold text-stone-900">{artisanForm.yearsActive || '18 years'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Buyer Preview */
                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-stone-300 bg-[#1B2E6B] text-amber-400 flex items-center justify-center shrink-0">
                      {buyerForm.avatarUrl ? (
                        <img src={buyerForm.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Buildings size={24} weight="fill" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-blue-900 inline-block mb-0.5">
                        {buyerForm.buyerType || 'Premium Boutique'}
                      </span>
                      <h3 className="text-xs font-bold text-[#1B2E6B] truncate">
                        {buyerForm.buyerName || 'Parampara Heritage'}
                      </h3>
                      <p className="text-[10px] text-stone-500">{buyerForm.name} · {buyerForm.title}</p>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-2 flex flex-col gap-1 text-[11px]">
                    <div className="flex justify-between text-stone-600">
                      <span>Location:</span>
                      <span className="font-semibold text-stone-900">{buyerForm.location || 'Mumbai'}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Phone:</span>
                      <span className="font-mono font-semibold text-stone-900">{buyerForm.phone || '+91 9876543211'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action shortcuts */}
              <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col gap-2">
                {activeTab === 'artisan' ? (
                  <button
                    type="button"
                    onClick={() => navigate('/passport/KG-2024-8921')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                  >
                    <IdentificationBadge size={15} className="text-[#E8762B]" />
                    <span>{t('settings.view_digital_passport', 'View Digital Passport')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/buyer/profile')}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                  >
                    <Buildings size={15} className="text-[#E8762B]" />
                    <span>{t('settings.view_buyer_profile', 'View Buyer Profile')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Experience Switcher Card */}
            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-lg border border-amber-200/80 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <ArrowsLeftRight size={16} className="text-[#E8762B]" />
                <span>{t('settings.quick_role_switch', 'Experience Switcher')}</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                {t('settings.switch_hint', 'KarigaarAI offers tailored interfaces for both artisan workshops and commercial procurement teams.')}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (role === 'artisan') {
                    switchToBuyer()
                    navigate('/buyer/discover')
                  } else {
                    switchToArtisan()
                    navigate('/dashboard')
                  }
                }}
                className="w-full py-2 px-3 rounded bg-white hover:bg-stone-50 border border-amber-300 text-[#1B2E6B] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>{role === 'artisan' ? t('switch_to_buyer', 'Switch to Buyer Discovery') : t('switch_to_artisan', 'Switch to Artisan Workshop')}</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Floating Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#1B2E6B] text-white px-4 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-2.5 text-xs font-medium"
          >
            <CheckCircle size={18} weight="fill" className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
