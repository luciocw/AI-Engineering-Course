import { COURSE_MANIFEST, type Exercise, type Module, type Day } from './manifest';
import { url } from '../url';

export function getAllExercisePaths() {
  const paths: Array<{
    params: { module: string; exercise: string };
    props: { exercise: Exercise; module: Module; day: Day };
  }> = [];

  for (const day of COURSE_MANIFEST) {
    for (const mod of day.modules) {
      for (const ex of mod.exercises) {
        paths.push({
          params: { module: mod.slug, exercise: ex.slug },
          props: { exercise: ex, module: mod, day },
        });
      }
    }
  }

  return paths;
}

export function getAllModulePaths() {
  const paths: Array<{
    params: { module: string };
    props: { module: Module; day: Day };
  }> = [];

  for (const day of COURSE_MANIFEST) {
    for (const mod of day.modules) {
      paths.push({
        params: { module: mod.slug },
        props: { module: mod, day },
      });
    }
  }

  return paths;
}

export function getAdjacentExercises(
  moduleSlug: string,
  exerciseSlug: string
): {
  prev: { slug: string; title: string; href: string } | null;
  next: { slug: string; title: string; href: string } | null;
} {
  const day = COURSE_MANIFEST[0]; // day-1
  const mod = day.modules.find((m) => m.slug === moduleSlug);
  if (!mod) return { prev: null, next: null };

  const idx = mod.exercises.findIndex((e) => e.slug === exerciseSlug);

  const prev =
    idx > 0
      ? {
          slug: mod.exercises[idx - 1].slug,
          title: mod.exercises[idx - 1].title,
          href: url(`/day-1/${moduleSlug}/${mod.exercises[idx - 1].slug}`),
        }
      : null;

  const next =
    idx < mod.exercises.length - 1
      ? {
          slug: mod.exercises[idx + 1].slug,
          title: mod.exercises[idx + 1].title,
          href: url(`/day-1/${moduleSlug}/${mod.exercises[idx + 1].slug}`),
        }
      : null;

  return { prev, next };
}

export function canRunInBrowser(moduleSlug: string): boolean {
  return moduleSlug === 'module-1-handlebars';
}
