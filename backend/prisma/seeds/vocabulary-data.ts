import { CEFRLevel, DeckStatus, DeckType, DeckVisibility } from '@prisma/client';

export interface SeedFlashcard {
  term: string;
  definition: string;
  example: string;
  imageUrl?: string;
}

export interface SeedDeck {
  title: string;
  slug: string;
  description: string;
  language: string;
  level: CEFRLevel;
  tags: string[];
  visibility: DeckVisibility;
  status: DeckStatus;
  type: DeckType;
  flashcards: SeedFlashcard[];
}

export const systemDecks: SeedDeck[] = [
  {
    title: 'Top 100 Irregular Verbs',
    slug: 'top-100-irregular-verbs',
    description:
      'Master the most frequently used English irregular verbs with Base, Past Simple, and Past Participle forms.',
    language: 'en',
    level: CEFRLevel.A1,
    tags: ['grammar', 'verbs', 'essential', 'irregular-verbs'],
    visibility: DeckVisibility.PUBLIC,
    status: DeckStatus.PUBLISHED,
    type: DeckType.SYSTEM,
    flashcards: [
      {
        term: 'be (was/were, been)',
        definition: 'To exist or live; to have a specified state or characteristic.',
        example: 'She was very happy with the results.',
      },
      {
        term: 'become (became, become)',
        definition: 'To begin to be, grow into, or develop into.',
        example: 'He became an experienced software engineer.',
      },
      {
        term: 'begin (began, begun)',
        definition: 'To perform the first part of an action or start doing something.',
        example: 'The class began at nine in the morning.',
      },
      {
        term: 'break (broke, broken)',
        definition: 'To separate into pieces suddenly or forcefully.',
        example: 'Be careful not to break the fragile glass.',
      },
      {
        term: 'bring (brought, brought)',
        definition: 'To take or carry someone or something to a place or person.',
        example: 'Please bring your laptop to the meeting.',
      },
      {
        term: 'build (built, built)',
        definition: 'To construct something by putting parts or materials together.',
        example: 'They built a responsive web application in three weeks.',
      },
      {
        term: 'buy (bought, bought)',
        definition: 'To obtain in exchange for payment.',
        example: 'I bought a new mechanical keyboard yesterday.',
      },
      {
        term: 'choose (chose, chosen)',
        definition: 'To pick out or select as being the best or most appropriate.',
        example: 'She chose the blue theme for her project.',
      },
      {
        term: 'come (came, come)',
        definition: 'To move or travel towards or into a place thought of as near.',
        example: 'They came to visit us last weekend.',
      },
      {
        term: 'do (did, done)',
        definition: 'To perform an action or activity.',
        example: 'Have you done your homework yet?',
      },
      {
        term: 'draw (drew, drawn)',
        definition: 'To produce a picture or diagram by making lines and marks.',
        example: 'The designer drew an architectural diagram.',
      },
      {
        term: 'drink (drank, drunk)',
        definition: 'To take a liquid into the mouth and swallow it.',
        example: 'He drank a cup of black coffee before starting to work.',
      },
      {
        term: 'drive (drove, driven)',
        definition: 'To operate and control the direction and speed of a motor vehicle.',
        example: 'She drove safely across the city in heavy rain.',
      },
      {
        term: 'eat (ate, eaten)',
        definition: 'To put food into the mouth, chew, and swallow it.',
        example: 'We ate lunch at an Italian restaurant.',
      },
      {
        term: 'fall (fell, fallen)',
        definition: 'To drop or come down freely under the influence of gravity.',
        example: 'Autumn leaves fell quietly to the ground.',
      },
      {
        term: 'feel (felt, felt)',
        definition: 'To experience a particular physical sensation or emotion.',
        example: 'I felt confident after passing all automated tests.',
      },
      {
        term: 'find (found, found)',
        definition: 'To discover or locate something unexpectedly or by searching.',
        example: 'She found the bug after inspecting the log output.',
      },
      {
        term: 'fly (flew, flown)',
        definition: 'To move through the air using wings or an aircraft.',
        example: 'The team flew to San Francisco for the tech conference.',
      },
      {
        term: 'forget (forgot, forgotten)',
        definition: 'To fail to remember or recall information.',
        example: 'Do not forget to commit your changes.',
      },
      {
        term: 'get (got, got/gotten)',
        definition: 'To come to have, receive, or acquire something.',
        example: 'He got immediate feedback from his mentor.',
      },
      {
        term: 'give (gave, given)',
        definition: 'To freely transfer the possession of something to someone.',
        example: 'She gave a great presentation about microservices.',
      },
      {
        term: 'go (went, gone)',
        definition: 'To move or travel from one place to another.',
        example: 'They went to the office early in the morning.',
      },
    ],
  },
  {
    title: 'Oxford 3000 Starter',
    slug: 'oxford-3000-starter',
    description:
      'Essential core words from the Oxford 3000 list tailored for beginner English learners.',
    language: 'en',
    level: CEFRLevel.A1,
    tags: ['oxford3000', 'beginner', 'starter', 'vocabulary'],
    visibility: DeckVisibility.PUBLIC,
    status: DeckStatus.PUBLISHED,
    type: DeckType.SYSTEM,
    flashcards: [
      {
        term: 'ability',
        definition: 'The physical or mental power or skill needed to do something.',
        example: 'She has a remarkable ability to learn new languages quickly.',
      },
      {
        term: 'accept',
        definition: 'To agree to take something or to consider something as satisfactory.',
        example: 'He decided to accept the job offer from the company.',
      },
      {
        term: 'accurate',
        definition: 'Correct, exact, and without any mistakes.',
        example: 'The calculation was completely accurate.',
      },
      {
        term: 'achieve',
        definition: 'To successfully complete something or reach a goal through effort.',
        example: 'With continuous practice, you will achieve fluency.',
      },
      {
        term: 'action',
        definition: 'The process of doing something, especially when dealing with a problem.',
        example: 'We need to take immediate action to resolve this issue.',
      },
      {
        term: 'activity',
        definition: 'A situation in which a lot of things are happening or being done.',
        example: 'The classroom was full of lively group activity.',
      },
      {
        term: 'admit',
        definition: 'To agree that something is true, often when you do not want to.',
        example: 'He had to admit that he made a mistake.',
      },
      {
        term: 'advice',
        definition: 'An opinion or recommendation offered as a guide to action.',
        example: 'My teacher gave me helpful advice on writing essays.',
      },
      {
        term: 'affect',
        definition: 'To produce an effect upon or cause a change in something.',
        example: 'Lack of sleep can severely affect your concentration.',
      },
      {
        term: 'agreement',
        definition: 'A decision or arrangement reached by two or more groups.',
        example: 'Both sides signed the partnership agreement.',
      },
      {
        term: 'allow',
        definition: 'To give permission for someone to do something.',
        example: 'The system will allow users to customize their decks.',
      },
      {
        term: 'almost',
        definition: 'Very nearly, not quite all.',
        example: 'We have almost finished all the planned features.',
      },
      {
        term: 'already',
        definition: 'Before the present time or earlier than expected.',
        example: 'I have already submitted the pull request.',
      },
      {
        term: 'alternative',
        definition: 'Something that is available as another possibility or choice.',
        example: 'We considered an alternative approach to database indexing.',
      },
      {
        term: 'amount',
        definition:
          'A quantity of something, typically the total of a thing or things in number, size, or value.',
        example: 'A small amount of daily practice leads to huge retention gains.',
      },
      {
        term: 'ancient',
        definition: 'Belonging to the very distant past and no longer in existence.',
        example: 'They visited ancient ruins during their vacation in Rome.',
      },
      {
        term: 'appear',
        definition: 'To become visible or noticeable; to seem to be.',
        example: 'The new flashcard will appear at the end of the deck.',
      },
      {
        term: 'apply',
        definition: 'To make a formal application or request; to put into use.',
        example: 'She decided to apply for the backend developer position.',
      },
      {
        term: 'approach',
        definition: 'A way of dealing with a situation or problem.',
        example: 'We adopted an incremental implementation approach.',
      },
      {
        term: 'arrange',
        definition: 'To put things in a neat, attractive, or required order.',
        example: 'You can arrange flashcards by dragging them into position.',
      },
    ],
  },
  {
    title: 'Oxford 3000 Elementary',
    slug: 'oxford-3000-elementary',
    description:
      'High-utility conversational vocabulary for pre-intermediate and elementary learners.',
    language: 'en',
    level: CEFRLevel.A2,
    tags: ['oxford3000', 'elementary', 'conversational'],
    visibility: DeckVisibility.PUBLIC,
    status: DeckStatus.PUBLISHED,
    type: DeckType.SYSTEM,
    flashcards: [
      {
        term: 'benefit',
        definition: 'A helpful or good effect, or something intended to help.',
        example: 'Regular spaced repetition brings long-term memory benefits.',
      },
      {
        term: 'boundary',
        definition: 'A real or imagined line that marks the edge or limit of something.',
        example: 'Hexagonal architecture establishes strict domain boundaries.',
      },
      {
        term: 'brief',
        definition: 'Lasting only a short time or using few words.',
        example: 'He gave a brief overview of the system architecture.',
      },
      {
        term: 'calculate',
        definition: 'To determine mathematically using numbers or facts.',
        example: 'The Leitner engine calculates the next review timestamp.',
      },
      {
        term: 'candidate',
        definition: 'A person who is competing to get a job or elected position.',
        example: 'The candidate demonstrated strong TypeScript skills in the interview.',
      },
      {
        term: 'capacity',
        definition: 'The total amount that can be contained or produced.',
        example: 'The database server was operating at full capacity.',
      },
      {
        term: 'challenge',
        definition: 'A task or situation that tests someone’s abilities.',
        example: 'Mastering algorithmic complexity is an exciting challenge.',
      },
      {
        term: 'clarify',
        definition: 'To make something clear or easier to understand.',
        example: 'Could you please clarify the acceptance criteria?',
      },
      {
        term: 'combine',
        definition: 'To join together to make a single thing or group.',
        example: 'We combine frontend components with backend API ports.',
      },
      {
        term: 'community',
        definition:
          'A group of people living in the same place or having a particular characteristic in common.',
        example: 'The open-source community created extensive documentation.',
      },
      {
        term: 'compare',
        definition:
          'To examine the character or qualities of something to discover similarities or differences.',
        example: 'Let us compare the performance of both queries.',
      },
      {
        term: 'complex',
        definition: 'Consisting of many different and connected parts.',
        example: 'The application handles complex state transitions cleanly.',
      },
      {
        term: 'confirm',
        definition: 'To state or prove the truth or accuracy of something.',
        example: 'Please confirm that all automated checks have passed.',
      },
      {
        term: 'constant',
        definition: 'Happening a lot or all the time; remaining unchanged.',
        example: 'Constant feedback improves code quality significantly.',
      },
      {
        term: 'crucial',
        definition: 'Extremely important or necessary.',
        example: 'Clear documentation is crucial for project maintainability.',
      },
      {
        term: 'curious',
        definition: 'Eager to know or learn something.',
        example: 'She was curious about how the SRS algorithm schedules reviews.',
      },
      {
        term: 'decrease',
        definition: 'To become less, or to make something become less.',
        example: 'Clean code decreases the number of production defects.',
      },
      {
        term: 'determine',
        definition: 'To discover the facts or truth about something; to decide.',
        example: 'Your answer accuracy determines the next Leitner box.',
      },
      {
        term: 'distinct',
        definition: 'Clearly noticeable; that certainly exists; separate.',
        example: 'Each domain entity has a distinct set of invariants.',
      },
      {
        term: 'efficient',
        definition: 'Working or operating quickly and effectively in an organized way.',
        example: 'Prisma generates efficient SQL queries with proper indexes.',
      },
    ],
  },
  {
    title: 'Essential IT & Software Terms',
    slug: 'essential-it-software-terms',
    description:
      'Core software engineering terminology, acronyms, and design concepts for developers.',
    language: 'en',
    level: CEFRLevel.B1,
    tags: ['tech', 'software-engineering', 'it', 'development'],
    visibility: DeckVisibility.PUBLIC,
    status: DeckStatus.PUBLISHED,
    type: DeckType.SYSTEM,
    flashcards: [
      {
        term: 'Idempotency',
        definition:
          'A property of an operation whereby it can be applied multiple times without changing the result beyond the initial application.',
        example: 'Database seeds and HTTP PUT requests should be idempotent.',
      },
      {
        term: 'Dependency Inversion',
        definition:
          'A software design principle stating that high-level modules should not depend on low-level modules; both should depend on abstractions.',
        example: 'We applied dependency inversion by creating a DeckRepositoryPort interface.',
      },
      {
        term: 'Cascade Delete',
        definition:
          'A foreign key constraint that automatically deletes child records when the corresponding parent record is deleted.',
        example: 'Deleting a deck triggers a cascade delete of all associated flashcards.',
      },
      {
        term: 'Spaced Repetition',
        definition:
          'An evidence-based learning technique that incorporates increasing intervals of time between subsequent review of previously learned material.',
        example: 'The 5-Box Leitner system is a popular spaced repetition implementation.',
      },
      {
        term: 'Invariant',
        definition:
          'A condition or business rule that must always hold true throughout the lifetime of a domain object or entity.',
        example: 'A deck cannot transition to PUBLISHED unless it has at least 2 flashcards.',
      },
      {
        term: 'Hexagonal Architecture',
        definition:
          'An architectural pattern separating core business logic from outside concerns via Ports and Adapters.',
        example:
          'Our backend follows hexagonal architecture with domain, application, and infrastructure layers.',
      },
      {
        term: 'Feature-Sliced Design',
        definition:
          'An architectural methodology for frontend development decomposing apps into layers: app, views, widgets, features, entities, shared.',
        example: 'FSD guarantees predictable dependency directions on the client side.',
      },
      {
        term: 'Index (Database)',
        definition:
          'A data structure that improves the speed of data retrieval operations on a database table at the cost of additional storage and write time.',
        example: 'We added a composite index on userId and nextReviewAt for fast due queries.',
      },
      {
        term: 'DTO (Data Transfer Object)',
        definition:
          'An object that carries data between processes or layers in order to reduce the number of method calls and validate payloads.',
        example:
          'CreateDeckDto validates the incoming HTTP request payload before reaching use cases.',
      },
      {
        term: 'Authentication vs Authorization',
        definition:
          'Authentication verifies identity (who you are); Authorization verifies permissions (what you are allowed to do).',
        example:
          'JwtAuthGuard handles authentication, while DeckPolicy handles owner authorization.',
      },
      {
        term: 'Distractor',
        definition:
          'An incorrect option in a multiple-choice question designed to test recall and discriminate mastery.',
        example: 'Learn mode selects 3 random distractor definitions from the deck.',
      },
      {
        term: 'Web Speech API',
        definition:
          'A browser JavaScript API enabling speech synthesis (text-to-speech) and speech recognition natively on the client.',
        example: 'We use window.speechSynthesis for zero-latency pronunciation audio.',
      },
      {
        term: 'Pagination',
        definition:
          'The process of dividing a large dataset into discrete pages to optimize network payload and database query performance.',
        example: 'Public catalog browse uses limit and offset pagination.',
      },
      {
        term: 'Value Object',
        definition:
          'A small immutable object in Domain-Driven Design whose equality is determined by its value rather than an explicit identity.',
        example: 'Email and DeckSlug are modeled as Value Objects in the domain layer.',
      },
      {
        term: 'Tree-shaking',
        definition:
          'A dead-code elimination technique used by modern JavaScript bundlers to remove unused exports from the final bundle.',
        example: 'Explicit named exports enable optimal tree-shaking.',
      },
      {
        term: 'Adapter',
        definition:
          'A software design component that translates between the interface required by domain ports and the concrete implementation of external tools.',
        example:
          'PrismaDeckRepository is an infrastructure adapter implementing DeckRepositoryPort.',
      },
      {
        term: 'Atomic Commit',
        definition:
          'A commit in version control that contains a single, coherent, and indivisible unit of work that leaves the codebase buildable.',
        example: 'We make atomic commits conforming to Conventional Commits standard.',
      },
      {
        term: 'Deadlock',
        definition:
          'A situation in concurrent programming where two or more processes are unable to proceed because each is waiting for the other to release resources.',
        example: 'Careful transaction ordering avoids database deadlocks during bulk reordering.',
      },
      {
        term: 'Debounce',
        definition:
          'A programming practice used to ensure that time-consuming tasks do not fire so often, by delaying execution until a pause in events.',
        example: 'The Unsplash image search input is debounced by 300 milliseconds.',
      },
      {
        term: 'Regression',
        definition:
          'A software bug that makes a feature stop functioning as intended after a certain event (like a code update or refactor).',
        example: 'Our automated test suite protects against regressions when adding new modules.',
      },
    ],
  },
];
