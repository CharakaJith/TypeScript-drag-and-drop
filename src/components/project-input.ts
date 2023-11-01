/// <reference path='./base-component.ts' />
/// <reference path='../decorators/decorator.ts' />
/// <reference path='../util/validations.ts' />
/// <reference path='../state/project.ts' />

namespace App {
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
}
