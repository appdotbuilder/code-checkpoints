import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// Using type-only import for better TypeScript compliance
import type { CodeCheckpoint } from '../../../server/src/schema';

interface CheckpointStatsProps {
  checkpoints: CodeCheckpoint[];
}

export function CheckpointStats({ checkpoints }: CheckpointStatsProps) {
  const stats = useMemo(() => {
    if (checkpoints.length === 0) {
      return {
        totalCheckpoints: 0,
        languageStats: [],
        tagStats: [],
        recentCheckpoints: 0
      };
    }

    // Language distribution
    const languageCounts = checkpoints.reduce((acc, checkpoint) => {
      acc[checkpoint.programming_language] = (acc[checkpoint.programming_language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const languageStats = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Tag distribution
    const tagCounts = checkpoints.reduce((acc, checkpoint) => {
      checkpoint.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const tagStats = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Recent checkpoints (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCheckpoints = checkpoints.filter(
      checkpoint => checkpoint.created_at >= sevenDaysAgo
    ).length;

    return {
      totalCheckpoints: checkpoints.length,
      languageStats,
      tagStats,
      recentCheckpoints
    };
  }, [checkpoints]);

  const getLanguageEmoji = (language: string): string => {
    const emojiMap: { [key: string]: string } = {
      'JavaScript': '🟨',
      'TypeScript': '🔷',
      'Python': '🐍',
      'Java': '☕',
      'C++': '⚡',
      'C#': '🔷',
      'Go': '🐹',
      'Rust': '🦀',
      'PHP': '🐘',
      'Ruby': '💎',
      'Swift': '🍎',
      'Kotlin': '🎯',
      'HTML': '🌐',
      'CSS': '🎨',
      'SQL': '🗄️'
    };
    return emojiMap[language] || '📄';
  };

  if (stats.totalCheckpoints === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span> Your Coding Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Ready to Start Your Coding Journey?
            </h3>
            <p className="text-gray-500">
              Create your first checkpoint to begin tracking your code snippets and insights!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📊</span> Your Coding Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalCheckpoints}
            </div>
            <div className="text-sm text-blue-800">Total Checkpoints</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.recentCheckpoints}
            </div>
            <div className="text-sm text-green-800">This Week</div>
          </div>
        </div>

        {/* Top Languages */}
        {stats.languageStats.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              🔧 Top Programming Languages
            </h4>
            <div className="space-y-3">
              {stats.languageStats.map(({ language, count }) => {
                const percentage = (count / stats.totalCheckpoints) * 100;
                return (
                  <div key={language}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm flex items-center gap-2">
                        <span>{getLanguageEmoji(language)}</span>
                        {language}
                      </span>
                      <span className="text-sm text-gray-500">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        {stats.tagStats.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              🏷️ Popular Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.tagStats.map(({ tag, count }) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs flex items-center gap-1"
                >
                  {tag}
                  <span className="bg-gray-400 text-white rounded-full px-1.5 py-0.5 text-xs">
                    {count}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            ✨ Quick Insights
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            {stats.languageStats.length > 0 && (
              <p>
                📈 You're most active in <strong>{stats.languageStats[0].language}</strong> with{' '}
                {stats.languageStats[0].count} checkpoints
              </p>
            )}
            {stats.recentCheckpoints > 0 && (
              <p>
                🔥 You've been productive! {stats.recentCheckpoints} checkpoints created this week
              </p>
            )}
            {stats.tagStats.length > 0 && (
              <p>
                🎯 Your top focus area is <strong>{stats.tagStats[0].tag}</strong>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}