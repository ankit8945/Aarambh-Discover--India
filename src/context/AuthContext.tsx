import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { signInUser, signInWithGoogleApi, switchUserRoleApi } from '../services/api';

export const GUEST_USER: UserProfile = {
  id: 'guest-explorer',
  name: 'Heritage Explorer',
  email: '',
  role: 'TRAVELER',
  isGuest: true,
  authProvider: 'email',
  joinedDate: new Date().toISOString(),
  contributionsCount: 0,
  approvedCount: 0,
  pendingCount: 0,
};

interface AuthContextType {
  user: UserProfile;
  signIn: (
    role: UserRole,
    email: string,
    name?: string,
    culturalSpecialization?: string,
    associatedLocation?: string
  ) => Promise<void>;
  signInWithGoogle: (params: {
    role: UserRole;
    email: string;
    name?: string;
    avatar?: string;
    photoURL?: string;
    culturalSpecialization?: string;
    associatedLocation?: string;
  }) => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  signOut: () => void;
  isAuthModalOpen: boolean;
  isAdminAuthModalOpen: boolean;
  preferredAuthRole: UserRole;
  openAuthModal: (preferredRole?: UserRole) => void;
  openAdminAuthModal: () => void;
  closeAuthModal: () => void;
  closeAdminAuthModal: () => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aarambh_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return GUEST_USER;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [preferredAuthRole, setPreferredAuthRole] = useState<UserRole>('TRAVELER');

  const [language, setLanguage] = useState<string>(() => {
    const saved = localStorage.getItem('aarambh_language');
    if (!saved) return 'EN';
    if (saved.toLowerCase() === 'english') return 'EN';
    if (saved.toLowerCase() === 'hindi') return 'HI';
    return saved.length > 2 ? saved.substring(0, 2).toUpperCase() : saved.toUpperCase();
  });

  useEffect(() => {
    if (user && !user.isGuest) {
      localStorage.setItem('aarambh_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aarambh_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aarambh_language', language);
  }, [language]);

  const openAuthModal = (preferredRole: UserRole = 'TRAVELER') => {
    setPreferredAuthRole(preferredRole);
    setIsAuthModalOpen(true);
  };

  const openAdminAuthModal = () => {
    setIsAdminAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const closeAdminAuthModal = () => {
    setIsAdminAuthModalOpen(false);
  };

  const signIn = async (
    role: UserRole,
    email: string,
    name?: string,
    culturalSpecialization?: string,
    associatedLocation?: string
  ) => {
    try {
      const userProfile = await signInUser(
        email,
        role,
        name,
        culturalSpecialization,
        associatedLocation
      );
      setUser({ ...userProfile, isGuest: false });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Sign in failed:', err);
      if (err.message && err.message.includes('Unauthorized')) {
        throw err;
      }
      // Fallback for demo purposes if backend fails for non-auth reasons
      const fallbackUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: name || (role === 'ADMIN' ? 'Cultural Curator' : role === 'CULTURAL_CREATOR' ? 'Cultural Contributor' : 'Heritage Traveler'),
        email,
        role,
        isGuest: false,
        authProvider: email.toLowerCase().includes('gmail.com') ? 'google' : 'email',
        culturalSpecialization,
        associatedLocation,
        joinedDate: new Date().toISOString(),
        contributionsCount: 0,
        approvedCount: 0,
        pendingCount: 0,
      };
      setUser(fallbackUser);
      setIsAuthModalOpen(false);
    }
  };

  const signInWithGoogle = async (params: {
    role: UserRole;
    email: string;
    name?: string;
    avatar?: string;
    photoURL?: string;
    culturalSpecialization?: string;
    associatedLocation?: string;
  }) => {
    try {
      const userProfile = await signInWithGoogleApi(params);
      setUser({ ...userProfile, isGuest: false, authProvider: 'google' });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google Sign in failed:', err);
      if (err.message && err.message.includes('Unauthorized')) {
        throw err;
      }
      const derivedName = params.name || params.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const fallbackUser: UserProfile = {
        id: `usr-g-${Date.now()}`,
        name: derivedName,
        email: params.email,
        role: params.role,
        isGuest: false,
        avatar: params.avatar || params.photoURL,
        photoURL: params.photoURL || params.avatar,
        authProvider: 'google',
        culturalSpecialization: params.culturalSpecialization,
        associatedLocation: params.associatedLocation,
        joinedDate: new Date().toISOString(),
        contributionsCount: 0,
        approvedCount: 0,
        pendingCount: 0,
      };
      setUser(fallbackUser);
      setIsAuthModalOpen(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user || user.isGuest) {
      setUser((prev) => ({ ...prev, role: newRole }));
      return;
    }
    try {
      const updated = await switchUserRoleApi(user.id, user.email, newRole);
      setUser({ ...updated, isGuest: false });
    } catch (e: any) {
      console.error('Switch role failed:', e);
      if (e.message && e.message.includes('Unauthorized')) {
        throw e;
      }
      setUser((prev) => ({ ...prev, role: newRole }));
    }
  };

  const signOut = () => {
    localStorage.removeItem('aarambh_user');
    setUser(GUEST_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signInWithGoogle,
        switchRole,
        signOut,
        isAuthModalOpen,
        isAdminAuthModalOpen,
        preferredAuthRole,
        openAuthModal,
        openAdminAuthModal,
        closeAuthModal,
        closeAdminAuthModal,
        language,
        setLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
