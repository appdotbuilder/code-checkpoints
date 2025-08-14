import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { CheckpointCard } from '@/components/CheckpointCard';
import { SearchInterface } from '@/components/SearchInterface';
import { CheckpointStats } from '@/components/CheckpointStats';
// Using type-only imports for better TypeScript compliance
import type { CodeCheckpoint, CreateCodeCheckpointInput, SearchCodeCheckpointsInput } from '../../server/src/schema';

function App() {
  // State management with proper typing
  const [checkpoints, setCheckpoints] = useState<CodeCheckpoint[]>([]);
  const [searchResults, setSearchResults] = useState<CodeCheckpoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  // Form state for creating new checkpoints
  const [formData, setFormData] = useState<CreateCodeCheckpointInput>({
    title: '',
    summary: '',
    code_snippet: '',
    user_feedback: '',
    programming_language: '',
    tags: [],
    embedding: [] // Will be populated with dummy data for demo
  });

  const [newTag, setNewTag] = useState('');

  // Load all checkpoints
  const loadCheckpoints = useCallback(async () => {
    try {
      const result = await trpc.getCodeCheckpoints.query();
      setCheckpoints(result);
    } catch (error) {
      console.error('Failed to load checkpoints:', error);
    }
  }, []);

  useEffect(() => {
    loadCheckpoints();
  }, [loadCheckpoints]);

  // Generate dummy embedding for demo purposes
  const generateDummyEmbedding = (): number[] => {
    // Generate a 384-dimensional embedding with random values
    return Array.from({ length: 384 }, () => Math.random() * 2 - 1);
  };

  // Handle creating a new checkpoint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Add dummy embedding for demo
      const checkpointData = {
        ...formData,
        embedding: generateDummyEmbedding()
      };
      
      const response = await trpc.createCodeCheckpoint.mutate(checkpointData);
      setCheckpoints((prev: CodeCheckpoint[]) => [response, ...prev]);
      
      // Reset form
      setFormData({
        title: '',
        summary: '',
        code_snippet: '',
        user_feedback: '',
        programming_language: '',
        tags: [],
        embedding: []
      });
      
      // Switch to browse tab to see the new checkpoint
      setActiveTab('browse');
    } catch (error) {
      console.error('Failed to create checkpoint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (searchData: SearchCodeCheckpointsInput) => {
    setIsSearching(true);
    
    try {
      // Add dummy embedding for semantic search demo
      const searchParams = {
        ...searchData,
        embedding: searchData.query ? generateDummyEmbedding() : undefined
      };
      
      const results = await trpc.searchCodeCheckpoints.query(searchParams);
      setSearchResults(results.results);
    } catch (error) {
      console.error('Failed to search checkpoints:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Add tag to form
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev: CreateCodeCheckpointInput) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Remove tag from form
  const removeTag = (tagToRemove: string) => {
    setFormData((prev: CreateCodeCheckpointInput) => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };



  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
      throw err; // Re-throw to let the component handle the error
    }
  };

  // Common programming languages
  const programmingLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📝 Code Checkpoints
          </h1>
          <p className="text-lg text-gray-600">
            Save, organize, and discover your code snippets with AI-powered search
          </p>
        </div>

        {/* API Stub Warning */}
        <Alert className="mb-6 border-yellow-300 bg-yellow-50">
          <AlertDescription className="text-yellow-800">
            ⚠️ <strong>Demo Mode:</strong> This application is running with stub API handlers. 
            Created checkpoints and search functionality are simulated for demonstration purposes.
          </AlertDescription>
        </Alert>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="create">➕ Create</TabsTrigger>
            <TabsTrigger value="browse">📚 Browse</TabsTrigger>
            <TabsTrigger value="search">🔍 Search</TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>✨</span> Create New Code Checkpoint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4">
                    <Input
                      placeholder="📋 Checkpoint title..."
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateCodeCheckpointInput) => ({ ...prev, title: e.target.value }))
                      }
                      required
                    />
                    
                    <Textarea
                      placeholder="📝 Brief summary of what this code does..."
                      value={formData.summary}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData((prev: CreateCodeCheckpointInput) => ({ ...prev, summary: e.target.value }))
                      }
                      rows={3}
                      required
                    />
                    
                    <Textarea
                      placeholder="💻 Paste your code snippet here..."
                      value={formData.code_snippet}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData((prev: CreateCodeCheckpointInput) => ({ ...prev, code_snippet: e.target.value }))
                      }
                      rows={8}
                      className="font-mono text-sm"
                      required
                    />
                    
                    <Textarea
                      placeholder="💭 Your feedback, thoughts, or lessons learned..."
                      value={formData.user_feedback}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData((prev: CreateCodeCheckpointInput) => ({ ...prev, user_feedback: e.target.value }))
                      }
                      rows={4}
                      required
                    />
                    
                    <Select
                      value={formData.programming_language}
                      onValueChange={(value: string) =>
                        setFormData((prev: CreateCodeCheckpointInput) => ({ ...prev, programming_language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="🔧 Select programming language..." />
                      </SelectTrigger>
                      <SelectContent>
                        {programmingLanguages.map((lang: string) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Tags Section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">🏷️ Tags</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={newTag}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                          onKeyPress={(e: React.KeyboardEvent) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button type="button" onClick={addTag} variant="outline">
                          Add
                        </Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="cursor-pointer">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-2 hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? '⏳ Creating...' : '🚀 Create Checkpoint'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse">
            <div className="space-y-6">
              {/* Statistics */}
              <CheckpointStats checkpoints={checkpoints} />
              
              {/* Checkpoints List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📚</span> All Checkpoints
                    <Badge variant="outline">{checkpoints.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {checkpoints.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">📭 No checkpoints yet</p>
                      <p className="text-gray-400 mt-2">Create your first code checkpoint to get started!</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {checkpoints.map((checkpoint: CodeCheckpoint) => (
                        <CheckpointCard
                          key={checkpoint.id}
                          checkpoint={checkpoint}
                          onCopy={copyToClipboard}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <div className="space-y-6">
              <SearchInterface
                onSearch={handleSearch}
                isSearching={isSearching}
              />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>📊</span> Search Results
                      <Badge variant="outline">{searchResults.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {searchResults.map((checkpoint: CodeCheckpoint) => (
                        <CheckpointCard
                          key={checkpoint.id}
                          checkpoint={checkpoint}
                          onCopy={copyToClipboard}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;