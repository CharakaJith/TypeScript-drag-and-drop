/// <reference path='./models/drag-drop.ts'/>
/// <reference path='./models/project.ts'/>
/// <reference path='./state/project.ts'/>
/// <reference path='./util/validations.ts'/>
/// <reference path='./decorators/decorator.ts'/>
/// <reference path='./components/base-component.ts'/>
/// <reference path='./components/project-input.ts'/>
/// <reference path='./components/project-item.ts'/>
/// <reference path='./components/project-list.ts'/>

namespace App {
  new ProjectInput();
  new ProjectList('active');
  new ProjectList('finished');
}
