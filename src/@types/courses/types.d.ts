
export type Course = {
    id: number;
    name: string;
    description: string;
}

export type CourseWithLessons = Course & {
    lessons: ProcessedLesson[];
}

export type ProcessedCourse = Course & {
    total_pages: number;
    completed_pages: number;
}

export type CourseCompletion = {
    id: number;
    total_pages: number;
    completed_pages: number;
};

export type Lesson = {
    id: number;
    name: string;
    course_id: number;
    exp: number;
}

export type ProcessedLesson = Lesson & {
    total_pages: number;
    completed_pages: number;
}

export type LessonWithPages = Lesson & {
    pages: ProcessedLessonPage[];
    last_completed_page: number;
}

export type LessonPage = {
    id: number;
    lesson_id: number;
    markdown: string;
}

export type ProcessedLessonPage = LessonPage & {
    actions: Action[];
}

export type Action = {
    id: number;
    lesson_page_id: number;
    markdown: string;
    type: ActionType; 
    code?: string;
    options?: {
        options: string[];
        answer: number; // index
    };
    tx_verify_url?: string;
    cta_url?: string;
}

export type ActionType = 'tx' | 'cta' | 'select' | 'code';

export type UserCompletedLesson = {
    id: number;
    lesson_id: number;
    user_id: number;
    exp: number;
}

export type UserCompletedPage = {
    id: number;
    user_id: number;
    lesson_page_id: number;
}
