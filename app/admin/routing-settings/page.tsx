"use client";

import { useEffect, useState } from "react";
import {
  BLVPageContainer,
  BLVSectionHeader,
  BLVCard,
  BLVSeparationLine,
} from "@/components/blve";
import {
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  Building2,
  TrendingUp,
  ShieldCheck,
  Percent,
} from "lucide-react";

export default function RoutingSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/routing-settings");
        const json = await res.json();
        setSettings(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load routing settings.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function saveSettings() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/routing-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings.");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <BLVPageContainer title="Routing Settings">
        <BLVCard className="p-12 flex flex-col items-center justify-center space-y-4">
          <RefreshCw size={40} className="text-gray-300 animate-spin" />
          <p className="text-gray-500 font-medium">Loading settings…</p>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  if (error && !settings) {
    return (
      <BLVPageContainer title="Routing Settings">
        <BLVCard className="p-12 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Error Loading Settings</h2>
            <p className="text-gray-500 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-bold"
          >
            Retry
          </button>
        </BLVCard>
      </BLVPageContainer>
    );
  }

  return (
    <BLVPageContainer 
      title="Routing Settings" 
      subtitle="Configure global parameters for the BLVΞ transaction routing engine"
    >
      <div className="max-w-4xl space-y-12">
        {/* GLOBAL PARAMETERS */}
        <div className="space-y-6">
          <BLVSectionHeader
            title="Global Parameters"
            subtitle="Core variables that affect all routing calculations"
            icon={<Settings size={20} />}
          />
          
          <BLVCard className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingField
                label="Boost Multiplier"
                description="Multiplier applied to routing amounts when boosts are active."
                icon={<Zap size={18} />}
                value={settings.boostMultiplier}
                onChange={(v: any) =>
                  setSettings({ ...settings, boostMultiplier: parseFloat(v) })
                }
              />

              <SettingField
                label="Civic Supplement (%)"
                description="Percentage added by the city or civic partner to amplify routing."
                icon={<Building2 size={18} />}
                value={settings.civicSupplement}
                onChange={(v: any) =>
                  setSettings({ ...settings, civicSupplement: parseFloat(v) })
                }
              />

              <SettingField
                label="Minimum Transaction Amount"
                description="Transactions below this amount do not generate routing."
                icon={<TrendingUp size={18} />}
                value={settings.minTransactionAmount}
                onChange={(v: any) =>
                  setSettings({ ...settings, minTransactionAmount: parseFloat(v) })
                }
              />

              <SettingField
                label="Default Routing Split (Org %)"
                description="Percentage of routing that goes to the organization."
                icon={<Percent size={18} />}
                value={settings.defaultOrgSplit}
                onChange={(v: any) =>
                  setSettings({ ...settings, defaultOrgSplit: parseFloat(v) })
                }
              />
            </div>

            <BLVSeparationLine />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SettingField
                label="Max Boost Per Transaction"
                description="Caps the maximum boost amount applied to a single transaction."
                icon={<ShieldCheck size={18} />}
                value={settings.maxBoostPerTx}
                onChange={(v: any) =>
                  setSettings({ ...settings, maxBoostPerTx: parseFloat(v) })
                }
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 font-bold shadow-lg shadow-black/10"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Settings
                    </>
                  )}
                </button>
                
                {success && (
                  <div className="flex items-center gap-2 text-green-600 font-bold animate-in fade-in slide-in-from-left-4 duration-300">
                    <CheckCircle2 size={20} />
                    Settings saved successfully
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-2 text-red-600 font-bold animate-in fade-in slide-in-from-left-4 duration-300">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </BLVCard>
        </div>

        {/* INFO SECTION */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <AlertCircle size={20} />
            Important Note
          </h3>
          <p className="text-gray-500 font-medium leading-relaxed">
            Changes to these settings will take effect immediately for all new transactions. 
            Existing transactions and routing pools will not be retroactively updated. 
            Please ensure all values are verified before saving.
          </p>
        </div>
      </div>
    </BLVPageContainer>
  );
}

function SettingField({
  label,
  description,
  icon,
  value,
  onChange,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="text-gray-400">{icon}</div>
        <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">{label}</label>
      </div>
      <p className="text-xs text-gray-500 font-medium leading-relaxed">{description}</p>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-black transition-all duration-200 font-bold text-gray-900 outline-none"
        />
      </div>
    </div>
  );
}
