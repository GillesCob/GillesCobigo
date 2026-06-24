import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import HeroSplit from '@/components/home/HeroSplit'
import HeadlineSection from '@/components/home/HeadlineSection'
import StackMatcher from '@/components/home/StackMatcher'
import Timeline from '@/components/home/Timeline'
import GitHubStats from '@/components/home/GitHubStats'
import SkillsRadar from '@/components/shared/SkillsRadar'

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const [reopenSkill] = useState(
    (location.state as { reopenSkill?: { skillName: string; tags: string[] } } | null)
      ?.reopenSkill ?? null
  )

  useEffect(() => {
    if (!reopenSkill) return;
    setTimeout(() => {
      document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    navigate(location.pathname, { replace: true, state: {} });
  }, []);

  return (
    <>
      <HeroSplit />
      <HeadlineSection />
      <StackMatcher />
      <Timeline />
      <GitHubStats />
      <section id="skills" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center">Compétences</h2>
          <SkillsRadar reopenSkill={reopenSkill} />
        </div>
      </section>
    </>
  )
}
