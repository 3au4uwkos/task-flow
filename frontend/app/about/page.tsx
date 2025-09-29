import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, Mail, Code, Coffee, Lightbulb } from "lucide-react"

export default function AboutPage() {
  const skills = [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "Python",
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "AWS",
    "Git",
  ]

  const experiences = [
    {
      title: "Senior Full Stack Developer",
      company: "TechCorp Solutions",
      period: "2022 - Present",
      description: "Leading development of scalable web applications using React, Node.js, and cloud technologies.",
    },
    {
      title: "Frontend Developer",
      company: "StartupXYZ",
      period: "2020 - 2022",
      description: "Built responsive user interfaces and improved application performance by 40%.",
    },
    {
      title: "Junior Developer",
      company: "WebDev Agency",
      period: "2019 - 2020",
      description: "Developed custom websites and learned modern web development practices.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-pattern min-h-screen">
        <Navigation />

        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/60 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Code className="h-16 w-16 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-balance">About the Developer</h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Passionate full-stack developer with a love for creating efficient, user-friendly applications that solve
              real-world problems.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Me */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    My Story
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    I'm a passionate developer who believes in the power of clean code and intuitive design. With over 5
                    years of experience in web development, I've worked on everything from small business websites to
                    large-scale enterprise applications.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    My journey started with a curiosity about how websites work, and it has evolved into a deep
                    appreciation for creating digital experiences that make people's lives easier. I specialize in
                    modern web technologies and enjoy tackling complex problems with elegant solutions.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    When I'm not coding, you can find me exploring new technologies, contributing to open-source
                    projects, or enjoying a good cup of coffee while planning the next big feature.
                  </p>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Professional Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {experiences.map((exp, index) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{exp.title}</h3>
                          <Badge variant="secondary" className="w-fit">
                            {exp.period}
                          </Badge>
                        </div>
                        <p className="text-sm text-primary mb-2">{exp.company}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Skills */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Technical Skills</CardTitle>
                  <CardDescription>Technologies I work with regularly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="bg-background/50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Get In Touch</CardTitle>
                  <CardDescription>Let's connect and build something amazing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <a
                      href="mailto:developer@example.com"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      developer@example.com
                    </a>
                    <a
                      href="https://github.com/developer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub Profile
                    </a>
                    <a
                      href="https://linkedin.com/in/developer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Fun Facts */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-primary" />
                    Fun Facts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Coffee enthusiast (5+ cups daily)</li>
                    <li>• Open source contributor</li>
                    <li>• Loves solving complex algorithms</li>
                    <li>• Always learning new technologies</li>
                    <li>• Believes in clean, maintainable code</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
