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
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-background p-1 sm:flex sm:w-fit">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() =>
            setActiveTab(tab)
          }
          className={`rounded-lg px-4 py-2 text-center text-sm font-medium transition-all duration-200 ${
            activeTab === tab
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}