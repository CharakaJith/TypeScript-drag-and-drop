import { Component } from './base-component.js';
import { DragTarget } from '../models/drag-drop.js';
import { autobind } from '../decorators/autobind.js';
import { projectState } from '../state/project.js';
import { ProjectItem } from './project-item.js';
import * as ProjectModel from '../models/project.js';

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: ProjectModel.Project[] = [];

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
      this.type === 'active'
        ? ProjectModel.ProjectStatus.Active
        : ProjectModel.ProjectStatus.Finished
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

    projectState.addListner((projects: ProjectModel.Project[]) => {
      const releventProjects = projects.filter((project) => {
        return this.type === 'active'
          ? project.status === ProjectModel.ProjectStatus.Active
          : project.status === ProjectModel.ProjectStatus.Finished;
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
