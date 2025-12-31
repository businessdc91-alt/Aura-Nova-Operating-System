'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import {
  Boxes,
  Code,
  Copy,
  Download,
  Play,
  RefreshCw,
  BookOpen,
  TestTube2,
  FileCode,
  Zap,
} from 'lucide-react';

// ============== TYPES ==============
interface ComponentOutput {
  component: string;
  storybook: string;
  tests: string;
  styles: string;
}

interface Framework {
  id: 'react' | 'vue' | 'svelte';
  name: string;
  color: string;
}

const FRAMEWORKS: Framework[] = [
  { id: 'react', name: 'React', color: 'bg-cyan-600' },
  { id: 'vue', name: 'Vue 3', color: 'bg-emerald-600' },
  { id: 'svelte', name: 'Svelte', color: 'bg-orange-600' },
];

export default function ConstructorPage() {
  const [framework, setFramework] = useState<'react' | 'vue' | 'svelte'>('react');
  const [componentName, setComponentName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<ComponentOutput | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState('component');

  const handleGenerate = async () => {
    if (!componentName.trim()) {
      toast.error('Please enter a component name');
      return;
    }
    if (!description.trim()) {
      toast.error('Please describe your component');
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading('Generating component...');

    try {
      // Simulate AI generation (replace with real API call)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = generateComponentCode(framework, componentName, description);
      setOutput(result);
      toast.success('Component generated!', { id: loadingToast });
    } catch (error) {
      toast.error('Generation failed', { id: loadingToast });
    }

    setIsGenerating(false);
  };

  const generateComponentCode = (
    framework: 'react' | 'vue' | 'svelte',
    name: string,
    desc: string
  ): ComponentOutput => {
    const pascalName = name.replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).replace(/\s+/g, '');
    const kebabName = name.toLowerCase().replace(/\s+/g, '-');

    if (framework === 'react') {
      return {
        component: `// ${pascalName}.tsx
// ${desc}

import React, { useState, useCallback } from 'react';
import styles from './${pascalName}.module.css';

export interface ${pascalName}Props {
  /** Primary content */
  children?: React.ReactNode;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const ${pascalName}: React.FC<${pascalName}Props> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      setIsActive(true);
      onClick();
      setTimeout(() => setIsActive(false), 150);
    }
  }, [disabled, onClick]);

  const baseClasses = styles.root;
  const variantClasses = styles[\`variant-\${variant}\`];
  const sizeClasses = styles[\`size-\${size}\`];
  const stateClasses = [
    disabled ? styles.disabled : '',
    isActive ? styles.active : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={\`\${baseClasses} \${variantClasses} \${sizeClasses} \${stateClasses} \${className}\`}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};

export default ${pascalName};`,
        storybook: `// ${pascalName}.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ${pascalName} } from './${pascalName}';

const meta: Meta<typeof ${pascalName}> = {
  title: 'Components/${pascalName}',
  component: ${pascalName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${desc}',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ${pascalName}>;

export const Primary: Story = {
  args: {
    children: 'Primary ${pascalName}',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary ${pascalName}',
    variant: 'secondary',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline ${pascalName}',
    variant: 'outline',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <${pascalName} size="sm">Small</${pascalName}>
      <${pascalName} size="md">Medium</${pascalName}>
      <${pascalName} size="lg">Large</${pascalName}>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Disabled ${pascalName}',
    disabled: true,
  },
};`,
        tests: `// ${pascalName}.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ${pascalName} } from './${pascalName}';

describe('${pascalName}', () => {
  it('renders children correctly', () => {
    render(<${pascalName}>Test Content</${pascalName}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<${pascalName} variant="secondary">Test</${pascalName}>);
    expect(container.firstChild).toHaveClass('variant-secondary');
  });

  it('applies size classes', () => {
    const { container } = render(<${pascalName} size="lg">Test</${pascalName}>);
    expect(container.firstChild).toHaveClass('size-lg');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<${pascalName} onClick={handleClick}>Click Me</${pascalName}>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click when disabled', () => {
    const handleClick = jest.fn();
    render(<${pascalName} disabled onClick={handleClick}>Disabled</${pascalName}>);
    fireEvent.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<${pascalName}>Accessible</${pascalName}>);
    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('tabIndex', '0');
  });

  it('sets aria-disabled when disabled', () => {
    render(<${pascalName} disabled>Disabled</${pascalName}>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });
});`,
        styles: `/* ${pascalName}.module.css */

.root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 150ms ease;
  user-select: none;
}

/* Variants */
.variant-primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  border: none;
}

.variant-primary:hover {
  background: linear-gradient(135deg, #6d28d9, #9333ea);
  transform: translateY(-1px);
}

.variant-secondary {
  background: #374151;
  color: white;
  border: none;
}

.variant-secondary:hover {
  background: #4b5563;
}

.variant-outline {
  background: transparent;
  color: #a855f7;
  border: 2px solid #a855f7;
}

.variant-outline:hover {
  background: rgba(168, 85, 247, 0.1);
}

/* Sizes */
.size-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.size-md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.size-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* States */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.active {
  transform: scale(0.98);
}`,
      };
    } else if (framework === 'vue') {
      return {
        component: `<!-- ${pascalName}.vue -->
<!-- ${desc} -->

<template>
  <div
    :class="[
      $style.root,
      $style[\`variant-\${variant}\`],
      $style[\`size-\${size}\`],
      { [$style.disabled]: disabled, [$style.active]: isActive }
    ]"
    :role="role"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export interface Props {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  role?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  role: 'button',
});

const emit = defineEmits<{
  click: [];
}>();

const isActive = ref(false);

const handleClick = () => {
  if (props.disabled) return;
  
  isActive.value = true;
  emit('click');
  
  setTimeout(() => {
    isActive.value = false;
  }, 150);
};
</script>

<style module>
.root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 150ms ease;
  user-select: none;
}

.variant-primary {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  border: none;
}

.variant-primary:hover {
  background: linear-gradient(135deg, #6d28d9, #9333ea);
  transform: translateY(-1px);
}

.variant-secondary {
  background: #374151;
  color: white;
  border: none;
}

.variant-secondary:hover {
  background: #4b5563;
}

.variant-outline {
  background: transparent;
  color: #a855f7;
  border: 2px solid #a855f7;
}

.variant-outline:hover {
  background: rgba(168, 85, 247, 0.1);
}

.size-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.size-md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.size-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.active {
  transform: scale(0.98);
}
</style>`,
        storybook: `// ${pascalName}.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3';
import ${pascalName} from './${pascalName}.vue';

const meta: Meta<typeof ${pascalName}> = {
  title: 'Components/${pascalName}',
  component: ${pascalName},
  parameters: {
    docs: {
      description: {
        component: '${desc}',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ${pascalName}>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
  },
  render: (args) => ({
    components: { ${pascalName} },
    setup() { return { args }; },
    template: '<${pascalName} v-bind="args">Primary ${pascalName}</${pascalName}>',
  }),
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => ({
    components: { ${pascalName} },
    setup() { return { args }; },
    template: '<${pascalName} v-bind="args">Secondary ${pascalName}</${pascalName}>',
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { ${pascalName} },
    template: \`
      <div style="display: flex; gap: 1rem; align-items: center;">
        <${pascalName} size="sm">Small</${pascalName}>
        <${pascalName} size="md">Medium</${pascalName}>
        <${pascalName} size="lg">Large</${pascalName}>
      </div>
    \`,
  }),
};`,
        tests: `// ${pascalName}.test.ts
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ${pascalName} from './${pascalName}.vue';

describe('${pascalName}', () => {
  it('renders slot content', () => {
    const wrapper = mount(${pascalName}, {
      slots: { default: 'Test Content' },
    });
    expect(wrapper.text()).toContain('Test Content');
  });

  it('emits click event', async () => {
    const wrapper = mount(${pascalName});
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(${pascalName}, {
      props: { disabled: true },
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('applies variant class', () => {
    const wrapper = mount(${pascalName}, {
      props: { variant: 'secondary' },
    });
    expect(wrapper.classes()).toContain('variant-secondary');
  });

  it('has correct accessibility attributes', () => {
    const wrapper = mount(${pascalName});
    expect(wrapper.attributes('role')).toBe('button');
    expect(wrapper.attributes('tabindex')).toBe('0');
  });
});`,
        styles: '', // Vue uses scoped styles in SFC
      };
    } else {
      // Svelte
      return {
        component: `<!-- ${pascalName}.svelte -->
<!-- ${desc} -->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let variant: 'primary' | 'secondary' | 'outline' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;

  let isActive = false;
  const dispatch = createEventDispatcher<{ click: void }>();

  function handleClick() {
    if (disabled) return;
    
    isActive = true;
    dispatch('click');
    
    setTimeout(() => {
      isActive = false;
    }, 150);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<div
  class="root variant-{variant} size-{size}"
  class:disabled
  class:active={isActive}
  role="button"
  tabindex={disabled ? -1 : 0}
  aria-disabled={disabled}
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  <slot />
</div>

<style>
  .root {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 150ms ease;
    user-select: none;
  }

  .variant-primary {
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: white;
    border: none;
  }

  .variant-primary:hover {
    background: linear-gradient(135deg, #6d28d9, #9333ea);
    transform: translateY(-1px);
  }

  .variant-secondary {
    background: #374151;
    color: white;
    border: none;
  }

  .variant-secondary:hover {
    background: #4b5563;
  }

  .variant-outline {
    background: transparent;
    color: #a855f7;
    border: 2px solid #a855f7;
  }

  .variant-outline:hover {
    background: rgba(168, 85, 247, 0.1);
  }

  .size-sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .size-md {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .size-lg {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }

  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .active {
    transform: scale(0.98);
  }
</style>`,
        storybook: `// ${pascalName}.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte';
import ${pascalName} from './${pascalName}.svelte';

const meta: Meta<typeof ${pascalName}> = {
  title: 'Components/${pascalName}',
  component: ${pascalName},
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ${pascalName}>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
  },
};`,
        tests: `// ${pascalName}.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ${pascalName} from './${pascalName}.svelte';

describe('${pascalName}', () => {
  it('renders with default props', () => {
    const { container } = render(${pascalName});
    expect(container.querySelector('.root')).toBeInTheDocument();
  });

  it('applies variant class', () => {
    const { container } = render(${pascalName}, {
      props: { variant: 'secondary' },
    });
    expect(container.querySelector('.variant-secondary')).toBeInTheDocument();
  });

  it('emits click event', async () => {
    const { component, container } = render(${pascalName});
    const onClick = vi.fn();
    component.$on('click', onClick);
    
    await fireEvent.click(container.querySelector('.root')!);
    expect(onClick).toHaveBeenCalled();
  });

  it('does not emit click when disabled', async () => {
    const { component, container } = render(${pascalName}, {
      props: { disabled: true },
    });
    const onClick = vi.fn();
    component.$on('click', onClick);
    
    await fireEvent.click(container.querySelector('.root')!);
    expect(onClick).not.toHaveBeenCalled();
  });
});`,
        styles: '', // Svelte uses scoped styles in SFC
      };
    }
  };

  const copyToClipboard = (content: string, name: string) => {
    navigator.clipboard.writeText(content);
    toast.success(`Copied ${name}`);
  };

  const downloadFile = (content: string, filename: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded ${filename}`);
  };

  const getFileExtension = (framework: string, type: string): string => {
    if (framework === 'react') {
      return type === 'styles' ? '.module.css' : '.tsx';
    } else if (framework === 'vue') {
      return type === 'component' ? '.vue' : '.ts';
    } else {
      return type === 'component' ? '.svelte' : '.ts';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Boxes size={40} className="text-aura-500" /> Component Constructor
        </h1>
        <p className="text-slate-400">
          Generate production-ready UI components with Storybook stories, tests, and styles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Configure Component</h2>

            {/* Framework Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Framework
              </label>
              <div className="flex gap-2">
                {FRAMEWORKS.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setFramework(fw.id)}
                    className={`flex-1 px-4 py-3 rounded font-semibold transition ${
                      framework === fw.id
                        ? `${fw.color} text-white`
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {fw.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Component Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Component Name
              </label>
              <Input
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="e.g., Action Button, Card Grid, Modal Dialog"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what the component does, its variants, states, and behavior..."
                className="w-full bg-slate-700 border-slate-600 text-white placeholder-slate-500 min-h-32"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-aura-600 to-purple-600 hover:from-aura-700 hover:to-purple-700 text-white font-bold py-3"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin mr-2" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2" size={18} />
                  Generate Component
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Output Panel */}
        <Card className="bg-slate-800 border-slate-700">
          <div className="p-6">
            {output ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Generated Output</h2>
                  <Button
                    size="sm"
                    onClick={() => setOutput(null)}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    <RefreshCw size={16} className="mr-1" /> Reset
                  </Button>
                </div>

                <Tabs value={activeOutputTab} onValueChange={setActiveOutputTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="component" className="text-xs">
                      <Code size={14} className="mr-1" /> Component
                    </TabsTrigger>
                    <TabsTrigger value="storybook" className="text-xs">
                      <BookOpen size={14} className="mr-1" /> Stories
                    </TabsTrigger>
                    <TabsTrigger value="tests" className="text-xs">
                      <TestTube2 size={14} className="mr-1" /> Tests
                    </TabsTrigger>
                    {output.styles && (
                      <TabsTrigger value="styles" className="text-xs">
                        <FileCode size={14} className="mr-1" /> Styles
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {(['component', 'storybook', 'tests', 'styles'] as const).map((tab) => {
                    const content = output[tab];
                    if (!content) return null;

                    const filename = `${componentName.replace(/\s+/g, '')}${
                      tab === 'component' ? '' : tab === 'storybook' ? '.stories' : '.test'
                    }${getFileExtension(framework, tab)}`;

                    return (
                      <TabsContent key={tab} value={tab}>
                        <div className="bg-slate-900 border border-slate-700 rounded overflow-hidden">
                          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                            <span className="text-sm font-mono text-slate-300">{filename}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => copyToClipboard(content, filename)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={() => downloadFile(content, filename)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </div>
                          <pre className="p-4 text-xs text-slate-100 overflow-x-auto max-h-80">
                            <code>{content}</code>
                          </pre>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </>
            ) : (
              <div className="h-full flex items-center justify-center py-16">
                <div className="text-center">
                  <Boxes size={48} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    Configure your component and click Generate
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
