import { Alert, Badge, Button, Card, CardContent, CardHeader, CardTitle, Grid, Hero, Section, SectionHeader } from './ui';

/**
 * Пример использования новых компонентов дизайн-системы
 * Удали этот файл после того как разберешься с компонентами
 */

export function ComponentShowcase() {
  return (
    <main className="space-y-16">
      {/* Hero Section */}
      <Hero
        title="Добро пожаловать на конференцию"
        subtitle="Присоединяйся к лучшим спикерам и нетворкингу"
        action={
          <>
            <Button variant="primary" size="lg">
              Зарегистрироваться
            </Button>
            <Button variant="outline" size="lg">
              Узнать больше
            </Button>
          </>
        }
      />

      {/* Section with Alerts */}
      <Section>
        <div className="mx-auto max-w-4xl space-y-4">
          <SectionHeader title="Примеры Alert компонентов" />
          <Alert variant="info" title="Информация">
            Это информационное сообщение для пользователя
          </Alert>
          <Alert variant="success" title="Успех!">
            Операция выполнена успешно
          </Alert>
          <Alert variant="warning" title="Предупреждение">
            Обрати внимание на это важное сообщение
          </Alert>
          <Alert variant="error" title="Ошибка">
            Что-то пошло не так
          </Alert>
        </div>
      </Section>

      {/* Section with Buttons */}
      <Section>
        <div className="mx-auto max-w-4xl">
          <SectionHeader title="Варианты кнопок" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Button size="sm" variant="primary">Small</Button>
            <Button size="md" variant="primary">Medium</Button>
            <Button size="lg" variant="primary">Large</Button>
            <Button variant="primary" isLoading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </div>
      </Section>

      {/* Section with Badges */}
      <Section>
        <div className="mx-auto max-w-4xl space-y-4">
          <SectionHeader title="Варианты Badge" />
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </div>
      </Section>

      {/* Section with Cards */}
      <Section>
        <div className="mx-auto max-w-6xl">
          <SectionHeader title="Примеры Card компонентов" />
          <Grid cols={3}>
            <Card hover>
              <CardHeader>
                <CardTitle>Карточка 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Это примерный контент карточки
                </p>
              </CardContent>
            </Card>
            <Card hover>
              <CardHeader>
                <CardTitle>Карточка 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Карточки поддерживают ховер эффект
                </p>
              </CardContent>
            </Card>
            <Card hover>
              <CardHeader>
                <CardTitle>Карточка 3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Мобильно-отзывчивый дизайн
                </p>
              </CardContent>
            </Card>
          </Grid>
        </div>
      </Section>

      {/* Section with mixed content */}
      <Section>
        <div className="mx-auto max-w-4xl">
          <SectionHeader title="Смешанные компоненты" />
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Комбинированный пример</CardTitle>
                <Badge variant="success">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                Вот пример того, как комбинировать разные компоненты вместе
              </p>
              <div className="flex gap-2">
                <Button variant="primary">Действие 1</Button>
                <Button variant="secondary">Действие 2</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </main>
  );
}

export default ComponentShowcase;
