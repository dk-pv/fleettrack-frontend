interface SettingsTabsProps {
  activeTab: string;
  setActiveTab: (
    value: string,
  ) => void;
}

const tabs = [
  "General",
  "Notifications",
  "Security",
  "Integration",
];

export default function SettingsTabs({
  activeTab,
  setActiveTab,
}: SettingsTabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-background p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() =>
            setActiveTab(tab)
          }
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === tab
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}