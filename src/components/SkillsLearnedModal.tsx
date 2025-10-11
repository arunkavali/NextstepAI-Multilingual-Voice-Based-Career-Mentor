import { Award, BookOpen, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { Skill } from '@/types';

interface SkillsLearnedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skills: Skill[];
}

export default function SkillsLearnedModal({ open, onOpenChange, skills }: SkillsLearnedModalProps) {
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getProficiencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical':
      case 'programming':
        return <BookOpen className="w-5 h-5" />;
      case 'design':
        return <Award className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Skills You've Explored</DialogTitle>
          <DialogDescription>
            Track your learning journey and skill development
          </DialogDescription>
        </DialogHeader>

        {skills.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No skills tracked yet</p>
            <p className="text-sm text-gray-400">Chat with the AI mentor to discover and learn new skills!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryIcon(category)}
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <Badge variant="secondary">{categorySkills.length}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categorySkills.map((skill) => (
                    <Card key={skill.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-base">{skill.skill_name}</h4>
                          <Badge
                            variant="outline"
                            className={getProficiencyColor(skill.proficiency_level)}
                          >
                            {skill.proficiency_level}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-500 mb-3">
                          Added {formatDate(skill.created_at)}
                        </p>

                        {skill.resources && Array.isArray(skill.resources) && skill.resources.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">Resources:</p>
                            <div className="space-y-1">
                              {skill.resources.slice(0, 2).map((resource: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline block"
                                >
                                  {resource.title || resource.url}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-blue-900 mb-1">Keep Learning!</h4>
              <p className="text-xs text-blue-700">
                Continue chatting with your AI mentor to discover more skills and expand your knowledge base.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
