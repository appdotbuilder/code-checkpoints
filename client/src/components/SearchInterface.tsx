import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Using type-only import for better TypeScript compliance
import type { SearchCodeCheckpointsInput } from '../../../server/src/schema';

interface SearchInterfaceProps {
  onSearch: (searchData: SearchCodeCheckpointsInput) => Promise<void>;
  isSearching: boolean;
}

export function SearchInterface({ onSearch, isSearching }: SearchInterfaceProps) {
  const [searchData, setSearchData] = useState<SearchCodeCheckpointsInput>({
    query: '',
    keywords: [],
    programming_language: '',
    tags: [],
    limit: 20,
    offset: 0
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Programming languages list
  const programmingLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearch(searchData);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !searchData.keywords?.includes(newKeyword.trim())) {
      setSearchData((prev: SearchCodeCheckpointsInput) => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setSearchData((prev: SearchCodeCheckpointsInput) => ({
      ...prev,
      keywords: prev.keywords?.filter(keyword => keyword !== keywordToRemove) || []
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !searchData.tags?.includes(newTag.trim())) {
      setSearchData((prev: SearchCodeCheckpointsInput) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSearchData((prev: SearchCodeCheckpointsInput) => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const clearAllFilters = () => {
    setSearchData({
      query: '',
      keywords: [],
      programming_language: '',
      tags: [],
      limit: 20,
      offset: 0
    });
  };

  const hasActiveFilters = searchData.query || 
    (searchData.keywords && searchData.keywords.length > 0) ||
    (searchData.tags && searchData.tags.length > 0) ||
    searchData.programming_language;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>🔍</span> Search Your Code Checkpoints
          </span>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              🗑️ Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              🤖 AI-Powered Semantic Search
            </label>
            <Input
              placeholder="Describe what you're looking for (e.g., 'React hooks for authentication', 'sorting algorithms in Python')..."
              value={searchData.query || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchData((prev: SearchCodeCheckpointsInput) => ({ 
                  ...prev, 
                  query: e.target.value || undefined 
                }))
              }
              className="text-base"
            />
            <p className="text-xs text-gray-500">
              💡 Use natural language to find code snippets based on their meaning and context
            </p>
          </div>

          {/* Quick Language Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              🔧 Programming Language
            </label>
            <Select
              value={searchData.programming_language || ''}
              onValueChange={(value: string) =>
                setSearchData((prev: SearchCodeCheckpointsInput) => ({ 
                  ...prev, 
                  programming_language: value || undefined 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Languages</SelectItem>
                {programmingLanguages.map((lang: string) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                type="button"
                className="w-full justify-between"
              >
                🔧 Advanced Filters
                <span className="text-xs text-gray-500">
                  {isAdvancedOpen ? '▲' : '▼'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {/* Keywords Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  🔍 Keywords
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add keyword to search in titles and descriptions..."
                    value={newKeyword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKeyword(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                  />
                  <Button type="button" onClick={addKeyword} variant="outline">
                    Add
                  </Button>
                </div>
                {(searchData.keywords && searchData.keywords.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {searchData.keywords.map((keyword: string) => (
                      <Badge key={keyword} variant="outline" className="cursor-pointer">
                        🔍 {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  🏷️ Tags
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Filter by specific tags..."
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
                {(searchData.tags && searchData.tags.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {searchData.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer">
                        🏷️ {tag}
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
            </CollapsibleContent>
          </Collapsible>

          {/* Search Button */}
          <Button type="submit" disabled={isSearching} className="w-full text-base py-6">
            {isSearching ? (
              <span className="flex items-center gap-2">
                <span className="pulse-loading">🔍</span> Searching...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                🚀 Search Checkpoints
              </span>
            )}
          </Button>

          {/* Search Tips */}
          {!hasActiveFilters && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                💡 <strong>Pro Tips:</strong>
                <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                  <li>Use natural language for semantic search (powered by AI embeddings)</li>
                  <li>Combine filters for more precise results</li>
                  <li>Keywords search in titles, summaries, and tags</li>
                  <li>Leave fields empty to search all checkpoints</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}