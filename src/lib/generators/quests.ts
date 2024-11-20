const questTemplates = [
  {
    type: "training",
    templates: [
      "Practice {skill} by doing {specific_action} for {duration} minutes",
      "Improve your {skill} by completing {specific_action} {count} times",
      "Do {specific_action} to enhance your {skill} for {duration} minutes"
    ]
  },
  {
    type: "study",
    templates: [
      "Read about {skill} for {duration} minutes and take notes",
      "Watch {count} educational videos about {skill} and summarize key points",
      "Complete {count} practice problems related to {skill}"
    ]
  },
  {
    type: "project",
    templates: [
      "Create a small project using {skill} that demonstrates {specific_concept}",
      "Document your progress in {skill} by writing {count} journal entries",
      "Practice {skill} by helping someone else learn a basic concept"
    ]
  }
];

const specificDetails = {
  specific_action: [
    "focused repetition exercises",
    "timed practice sessions",
    "structured drills",
    "review exercises",
    "practical applications"
  ],
  specific_concept: [
    "basic principles",
    "fundamental techniques",
    "problem-solving methods",
    "common use cases",
    "best practices"
  ],
  duration: [
    "15",
    "20",
    "25",
    "30",
    "45"
  ],
  count: [
    "3",
    "5",
    "7",
    "10",
    "15"
  ]
};

function generateQuestDescription(template: string, skill: string): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    if (key === 'skill') return skill;
    return specificDetails[key as keyof typeof specificDetails]?.[Math.floor(Math.random() * specificDetails[key as keyof typeof specificDetails].length)] ?? match;
  });
} 