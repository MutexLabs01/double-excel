import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Save, History, Download, Upload, Brain, BarChart3, FileSpreadsheet, PieChart, TrendingUp, Share2 } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface HeaderBarProps {
  fileName: string;
  fileType: string;
  versionName: string;
  unsavedChanges: boolean;
  onBack: () => void;
  onSave: () => void;
  onShowHistory: () => void;
  onExport: () => void;
  onImport: () => void;
  onShare?: () => void;
  shareLink?: string;
  onShowML?: () => void;
  onCreateSheet?: (name: string) => void;
  onCreateChart?: (name: string) => void;
  onCreateFinancialModel?: (name: string) => void;
  onNavigateToEDA?: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  fileName,
  fileType,
  versionName,
  unsavedChanges,
  onBack,
  onSave,
  onShowHistory,
  onExport,
  onImport,
  onShare,
  shareLink,
  onShowML,
  onCreateSheet,
  onCreateChart,
  onCreateFinancialModel,
  onNavigateToEDA
}) => (
  <header className="bg-white shadow-sm border-b">
    <div className="px-6">
      <div className="flex items-center h-16">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-4"
          >
            ← Back to Home
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{fileName || 'No file selected'}</h2>
            <p className="text-sm text-gray-500">
              {fileType} • {versionName}
              {unsavedChanges && <span className="text-amber-600 ml-2">• Unsaved changes</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center ml-8">
          <NavigationMenu className="z-50">
            <NavigationMenuList className="flex items-center space-x-2">
              {/* Create New Group */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-green-600 text-white hover:bg-green-700">
                  Create New
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-6 w-[400px]">
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          const name = prompt('Enter spreadsheet name:');
                          if (name && onCreateSheet) {
                            onCreateSheet(name);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium leading-none">Spreadsheet</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Create a new spreadsheet
                            </p>
                          </div>
                        </div>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          const name = prompt('Enter chart name:');
                          if (name && onCreateChart) {
                            onCreateChart(name);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium leading-none">Chart</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Create a new chart
                            </p>
                          </div>
                        </div>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          const name = prompt('Enter financial model name:');
                          if (name && onCreateFinancialModel) {
                            onCreateFinancialModel(name);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium leading-none">Financial Model</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Create a new financial model
                            </p>
                          </div>
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ML & Analytics Group */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>ML & Analytics</NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-6 w-[400px]">
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          onShowML?.();
                        }}
                      >
        <div className="flex items-center space-x-2">
                          <Brain className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium leading-none">Machine Learning</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              AI-powered data analysis and predictions
                            </p>
                          </div>
                        </div>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigateToEDA?.();
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <PieChart className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium leading-none">Exploratory Data Analysis</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Statistical analysis and data exploration
                            </p>
                          </div>
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Version Control Group */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Version Control</NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-6 w-[400px]">
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          onSave();
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium leading-none">Create Checkpoint</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Save current state as a checkpoint
                            </p>
                          </div>
                        </div>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          onShowHistory();
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <History className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium leading-none">Version History</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              View and restore previous versions
                            </p>
                          </div>
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* File Operations Group */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>File Operations</NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-3 p-6 w-[400px]">
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          onImport();
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Upload className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium leading-none">Import Data</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Import CSV, Excel, or other data files
                            </p>
                          </div>
                        </div>
                      </a>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <a
                        href="#"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          onExport();
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium leading-none">Export Project</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Download project as ZIP file
                            </p>
                          </div>
                        </div>
                      </a>
                    </NavigationMenuLink>
          {onShare && (
                      <NavigationMenuLink asChild>
                        <a
                          href="#"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            onShare();
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <Share2 className="h-4 w-4" />
                            <div>
                              <div className="text-sm font-medium leading-none">Share Project</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Share project with team members
                              </p>
                            </div>
                          </div>
                        </a>
                      </NavigationMenuLink>
                    )}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="ml-auto">
          <UserButton />
        </div>
      </div>
      {shareLink && (
        <div className="mt-2 text-blue-700 text-sm">
          Share this link: <a href={shareLink} className="underline" target="_blank" rel="noopener noreferrer">{shareLink}</a>
        </div>
      )}
    </div>
  </header>
);

export default HeaderBar; 