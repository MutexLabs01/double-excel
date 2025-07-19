import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

interface TerminalProps {
  projects: { id: string; name: string }[];
  currentProjectId: string | null;
  projectData: any;
  onOpenProject: (id: string) => void;
  onExportFile?: (filename: string) => void;
}

interface Command {
  name: string;
  description: string;
  usage: string;
}

const Terminal: React.FC<TerminalProps> = ({ 
  projects, 
  currentProjectId, 
  projectData, 
  onOpenProject,
  onExportFile 
}) => {
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('~');
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = [
    { name: 'help', description: 'Show all available commands', usage: 'help' },
    { name: 'whoami', description: 'Show current user details', usage: 'whoami' },
    { name: 'cd', description: 'Change directory', usage: 'cd <project_name> or cd ..' },
    { name: 'ls', description: 'List files and directories', usage: 'ls' },
    { name: 'export', description: 'Export a file', usage: 'export <filename>' },
    { name: 'open', description: 'Open current project', usage: 'open' },
    { name: 'clear', description: 'Clear terminal', usage: 'clear' }
  ];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    let result = '';

    switch (command) {
      case 'help':
        result = 'Available commands:\n' + 
          commands.map(cmd => 
            `${cmd.name.padEnd(10)} - ${cmd.description}\n   Usage: ${cmd.usage}`
          ).join('\n');
        break;

      case 'whoami':
        if (user) {
          result = `User: ${user.fullName || user.username || 'Unknown'}\n` +
                   `Email: ${user.primaryEmailAddress?.emailAddress || 'No email'}\n` +
                   `User ID: ${user.id}`;
        } else {
          result = 'No user logged in';
        }
        break;

      case 'cd':
        if (args.length === 0) {
          result = 'Usage: cd <project_name> or cd ..';
        } else if (args[0] === '..') {
          if (currentProject) {
            setCurrentProject(null);
            setCurrentPath('~');
            result = 'Moved back to root directory';
          } else {
            result = 'Already at root directory';
          }
        } else {
          const project = projects.find(p => p.name.toLowerCase() === args[0].toLowerCase());
          if (project) {
            setCurrentProject(project.id);
            setCurrentPath(`~/projects/${project.name}`);
            result = `Changed directory to ${project.name}`;
          } else {
            result = `Project '${args[0]}' not found`;
          }
        }
        break;

      case 'ls':
        if (currentProject) {
          // Inside a project - show files and folders
          const files = Object.values(projectData.files || {});
          const folders = Object.values(projectData.folders || {});
          
          result = 'Files and directories:\n';
          if (folders.length > 0) {
            result += folders.map((folder: any) => `📁 ${folder.name}/`).join('\n') + '\n';
          }
          if (files.length > 0) {
            result += files.map((file: any) => 
              `${file.type === 'spreadsheet' ? '📊' : '📈'} ${file.name}`
            ).join('\n');
          }
          if (folders.length === 0 && files.length === 0) {
            result += 'No files or folders found';
          }
        } else {
          // At root - show projects
          if (projects.length > 0) {
            result = 'Projects:\n' + projects.map(project => `📁 ${project.name}/`).join('\n');
          } else {
            result = 'No projects found';
          }
        }
        break;

      case 'export':
        if (args.length === 0) {
          result = 'Usage: export <filename>';
        } else if (!currentProject) {
          result = 'Must be inside a project to export files';
        } else {
          const filename = args[0];
          const files = Object.values(projectData.files || {});
          const file = files.find((f: any) => f.name === filename);
          
          if (file) {
            if (onExportFile) {
              onExportFile(filename);
              result = `Exported ${filename}`;
            } else {
              result = 'Export functionality not available';
            }
          } else {
            result = `File '${filename}' not found`;
          }
        }
        break;

      case 'open':
        if (currentProject) {
          onOpenProject(currentProject);
          result = 'Opening project...';
        } else {
          result = 'No project selected. Use cd <project_name> first.';
        }
        break;

      case 'clear':
        setOutput([]);
        return;

      case '':
        return;

      default:
        result = `Command '${command}' not found. Type 'help' for available commands.`;
    }

    setOutput(prev => [...prev, `$ ${cmd}`, result]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setHistory(prev => [...prev, input]);
      executeCommand(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        setInput(history[history.length - 1]);
      }
    }
  };

  return (
    <div className="bg-black text-green-400 font-mono text-sm h-full flex flex-col">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-gray-300 text-xs">Terminal</div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto"
        style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
      >
        <div className="mb-4">
          <div className="text-green-400">
            Welcome to Double-Excel Terminal
          </div>
          <div className="text-gray-400 text-xs mt-1">
            Type 'help' for available commands
          </div>
        </div>

        {output.map((line, index) => (
          <div key={index} className="mb-1 whitespace-pre-wrap">
            {line}
          </div>
        ))}

        {/* Current Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-400 mr-2">
            {currentPath} $
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-green-400 outline-none"
            autoFocus
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
};

export default Terminal; 