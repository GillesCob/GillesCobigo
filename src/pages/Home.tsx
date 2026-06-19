import HeroSplit from '@/components/home/HeroSplit'
import HeadlineSection from '@/components/home/HeadlineSection'
import StackMatcher from '@/components/home/StackMatcher'
import Timeline from '@/components/home/Timeline'
import GitHubStats from '@/components/home/GitHubStats'
import ProjectsSection from '@/components/home/ProjectsSection'
import ArticlesSection from '@/components/home/ArticlesSection'
import SkillsRadar from '@/components/shared/SkillsRadar'

export default function Home() {
  return (
    <>
      <HeroSplit />
      <HeadlineSection />
      <StackMatcher />
      <Timeline />
      <GitHubStats />
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center">Compétences</h2>
          <SkillsRadar />
        </div>
      </section>
      <ProjectsSection />
      <ArticlesSection />
    </>
  )
}
