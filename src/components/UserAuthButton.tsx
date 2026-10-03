import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, User as UserIcon, Cloud, Sparkles, ChevronDown } from 'lucide-react';

interface UserAuthButtonProps {
  onOpenSubscription: () => void;
}

export const UserAuthButton: React.FC<UserAuthButtonProps> = ({ onOpenSubscription }) => {
  const { currentUser, signInWithGoogle, logOut, loadingAuth } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setSigningIn(false);
    }
  };

  if (loadingAuth) {
    return <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />;
  }

  if (!currentUser) {
    return (
      <button
        onClick={handleSignIn}
        disabled={signingIn}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 transition text-xs font-medium cursor-pointer"
        title="Sign in with Google to sync documents to Firestore"
      >
        <LogIn className="w-3.5 h-3.5 text-amber-400" />
        <span>{signingIn ? 'Signing in...' : 'Sign In'}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition text-xs text-zinc-200 cursor-pointer"
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt="Avatar"
            className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400/40"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
            {currentUser.displayName ? currentUser.displayName[0] : 'U'}
          </div>
        )}
        <span className="hidden sm:inline font-medium max-w-[100px] truncate">
          {currentUser.displayName || 'Account'}
        </span>
        <ChevronDown className="w-3 h-3 text-zinc-400" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-2xl shadow-black/90 z-50 space-y-3 animate-fade-in">
          <div className="border-b border-zinc-800 pb-2">
            <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
            <p className="text-[10px] text-zinc-400 font-mono truncate">{currentUser.email}</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
              <Cloud className="w-3 h-3" />
              <span>Firestore Sync Active</span>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setDropdownOpen(false);
                onOpenSubscription();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Subscription & Billing</span>
            </button>

            <button
              onClick={() => {
                setDropdownOpen(false);
                logOut();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
