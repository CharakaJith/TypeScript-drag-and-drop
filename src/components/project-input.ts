import { Component } from './base-component.js';
import * as Validations from '../util/validations.js';
import { autobind } from '../decorators/autobind.js';
import { projectState } from '../state/project.js';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

    const titleValidatable: Validations.Validatable = {
      value: title,
      required: true,
    };
    const descreptionValidatable: Validations.Validatable = {
      value: descreption,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validations.Validatable = {
      value: people,
      required: true,
      min: 1,
    };

    if (
      !Validations.validate(titleValidatable) ||
      !Validations.validate(descreptionValidatable) ||
      !Validations.validate(peopleValidatable)
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
