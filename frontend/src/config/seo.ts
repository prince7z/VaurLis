import { matchPath } from 'react-router-dom';

type SeoConfig = {
  title: string;
  description: string;
  robots?: string;
};

export const siteName = 'VaurLis Educations';
export const siteUrl = 'https://vaurlis.vercel.app';

export const defaultSeo: SeoConfig = {
  title: 'VaurLis Educations | Learn from Harvard & MIT Teachers',
  description:
    'VaurLis Educations offers high-quality learning content from Harvard and MIT teachers with free certification, live classes, and modern course management.',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
};

const privateRobots = 'noindex, nofollow, noarchive';

export function getSeoForPath(pathname: string): SeoConfig {
  if (pathname === '/') {
    return defaultSeo;
  }

  if (pathname === '/courses') {
    return {
      title: 'Browse Courses | VaurLis Educations',
      description:
        'Explore free and premium courses from Harvard and MIT teachers across technology, business, science, and career growth.',
    };
  }

  if (pathname === '/instructors') {
    return {
      title: 'Instructors | VaurLis Educations',
      description:
        'Meet the expert instructors behind VaurLis Educations and discover the teachers shaping the learning experience.',
    };
  }

  if (pathname === '/signin' || pathname === '/signup' || pathname === '/login' || pathname === '/register') {
    return {
      title: 'Join VaurLis Educations | Secure Access',
      description:
        'Sign in or create an account to access courses, track progress, and unlock free certification on VaurLis Educations.',
      robots: privateRobots,
    };
  }

  if (pathname === '/addcourse' || pathname === '/releasedcourses' || pathname === '/purchasedcourses' || pathname === '/transactions' || pathname === '/dev/logs' || pathname === '/rough') {
    return {
      title: 'Dashboard | VaurLis Educations',
      description:
        'Internal dashboard area for course management, releases, purchases, and platform operations.',
      robots: privateRobots,
    };
  }

  if (matchDynamic(pathname, '/course/:id')) {
    return {
      title: 'Course Details | VaurLis Educations',
      description:
        'View course details, instructor information, and learning content on VaurLis Educations.',
    };
  }

  if (
    matchDynamic(pathname, '/course/content/:id') ||
    matchDynamic(pathname, '/course/purchase/:id') ||
    matchDynamic(pathname, '/course/update/:id') ||
    matchDynamic(pathname, '/course/certificate/:id') ||
    matchDynamic(pathname, '/verify/:certId') ||
    matchDynamic(pathname, '/course/live/:id') ||
    matchDynamic(pathname, '/live/sender/:roomId') ||
    matchDynamic(pathname, '/live/receiver/:roomId')
  ) {
    return {
      title: 'Private Learning Area | VaurLis Educations',
      description:
        'Access your learning session, certificate, or course workflow in VaurLis Educations.',
      robots: privateRobots,
    };
  }

  if (matchDynamic(pathname, '/:username')) {
    return {
      title: 'Instructor Profile | VaurLis Educations',
      description:
        'View an instructor profile, credentials, and educational content on VaurLis Educations.',
    };
  }

  return defaultSeo;
}

function matchDynamic(pathname: string, pattern: string) {
  return Boolean(matchPath({ path: pattern, end: true }, pathname));
}