/* drag and drop interfaces */
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

/* project type */
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public descreption: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

/* project state management */
type Listner<T> = (items: T[]) => void;

class State<T> {
  protected listners: Listner<T>[] = [];

  addListner(listnerFunction: Listner<T>) {
    this.listners.push(listnerFunction);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();

    return this.instance;
  }

  addProject(title: string, descreption: string, numOfPeople: number) {
    const id = Math.random().toString();

    const newProject = new Project(id, title, descreption, numOfPeople, ProjectStatus.Active);

    this.projects.push(newProject);

    this.updateListners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => {
      return project.id === projectId;
    });

    if (project && project.status !== newStatus) {
      project.status = newStatus;

      this.updateListners();
    }
  }

  private updateListners() {
    for (const listnerFunction of this.listners) {
      listnerFunction(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

/* validation logic */
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  const value = validatableInput.value;
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && value.toString().trim().length !== 0;
  }
  if (validatableInput.minLength != null && typeof value === 'string') {
    isValid = isValid && value.length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null && typeof value === 'string') {
    isValid = isValid && value.length <= validatableInput.maxLength;
  }
  if (validatableInput.min != null && typeof value === 'number') {
    isValid = isValid && value >= validatableInput.min;
  }
  if (validatableInput.max != null && typeof value === 'number') {
    isValid = isValid && value <= validatableInput.max;
  }

  return isValid;
}

/* autobind decorator */
function autobind(target: any, methodName: string, descreptor: PropertyDescriptor) {
  const originalMethod = descreptor.value;

  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFunction = originalMethod.bind(this);

      return boundFunction;
    },
  };

  return adjDescriptor;
}

/* component base class */
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedContent = document.importNode(this.templateElement.content, true);
    this.element = importedContent.firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

/* project item class */
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get persons() {
    return this.project.people === 1 ? '1 person' : `${this.project.people} persons`;
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  @autobind
  dragEndHandler(event: DragEvent): void {}

  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.element.querySelector('p')!.textContent = this.project.descreption;
  }
}

/* project list class */
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[] = [];

  constructor(public type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();

      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }

  @autobind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer.getData('text/plain');
    projectState.moveProject(
      projectId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autobind
  dragLeaveHandler(event: DragEvent): void {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  private renderProjects() {
    const listElement = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;

    listElement.innerHTML = '';

    for (const projectItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
    }
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListner((projects: Project[]) => {
      const releventProjects = projects.filter((project) => {
        return this.type === 'active'
          ? project.status === ProjectStatus.Active
          : project.status === ProjectStatus.Finished;
      });

      this.assignedProjects = releventProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;

    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }
}

/* project input class */
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInput: HTMLInputElement;
  descreptionInput: HTMLInputElement;
  peopleInput: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleInput = this.element.querySelector('#title') as HTMLInputElement;
    this.descreptionInput = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInput = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent() {}

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();

    const userInputs = this.gatherUserInputs();
    if (Array.isArray(userInputs)) {
      const [title, descreption, people] = userInputs;

      projectState.addProject(title, descreption, people);

      this.clearInputs();
    }
  }

  private gatherUserInputs(): [string, string, number] | void {
    const title = this.titleInput.value;
    const descreption = this.descreptionInput.value;
    const people = this.peopleInput.value;

    const titleValidatable: Validatable = {
      value: title,
      required: true,
    };
    const descreptionValidatable: Validatable = {
      value: descreption,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: people,
      required: true,
      min: 1,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descreptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input, please try again!');
      return;
    }

    return [title, descreption, +people];
  }

  private clearInputs() {
    this.titleInput.value = '';
    this.descreptionInput.value = '';
    this.peopleInput.value = '';
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
