// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

const eleForm = $("#modal-form");
const inputDesc = $("#taskDescription");
const inputDate = $("#dateInput");
const inputTask = $("#taskInput");
const btnTaskAccept = $("#btnTaskAccept");
const eleModal = $("#formModal");

// simple function to create and append divs as alerts
function createAppendAlert(inStr) {
  const eleAlert = $("<div>");
  // set attributes to display our alert
  eleAlert.attr("class", "alert alert-danger");
  eleAlert.attr("id", "tempDanger");
  eleAlert.attr("role", "alert");
  // remove any existing alert
  $("#tempDanger").remove();
  // set the text based on the string passed
  eleAlert.text(inStr);
  // append the element to the modal
  eleForm.append(eleAlert);
}

// function to handle input validation on the form
function inputValidationHandler(task, date, desc) {
  // if no value in task
  if (!task) {
    createAppendAlert("Please enter a value for the Task Name!");
    return 0;
  }
  // if no value in date display alert
  if (!date) {
    createAppendAlert("Please select a date!");
    return 0;
  }
  // if no value in content display alert
  if (!desc) {
    createAppendAlert("Please enter a description for the task!");
    return 0;
  }
  // all conditions are true and returning values, remove the temporary danger alert div
  $("#tempDanger").remove();
  // return true to continue generateTaskID fn
  return 1;
}

// simple form cleanup function to clean and hide the modal
function formCleanup() {
  inputTask.val("");
  inputDate.val("");
  inputDesc.val("");
  eleModal.modal("hide");
}

// generate the task ID
function generateTaskId(arrTask) {
  // if the array is empty then return 0 for the first taskID
  if (arrTask.length === 0) {
    return 0;
  } else {
    // if the array is not empty then determine the array length and the taskID of the most recent task
    const varLength = arrTask.length;
    const varPrevTask = arrTask[varLength - 1].TaskID;
    // if the previousTaskID was higher than the length (ie some tasks were deleted) then add to the previousTask
    if (varPrevTask > varLength) {
      return varPrevTask + 1;
    }
    // if that is not the case, add to the length of the array
    return varLength;
  }
}

function colorChanger(task) {
  const today = dayjs();
  const taskDate = dayjs(task.Date);

  if (taskDate.isBefore(today)) {
    return "danger";
  }
  if (taskDate.diff(today, "day") <= 3) {
    return "warning";
  }
  return "light";
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const cardColor = colorChanger(task);
  const cardTask = task.Task;
  const cardDate = task.Date;
  const cardDesc = task.Description;
  const cardStatus = task.Status;
  let eleParent;
  const eleCard = `
  <div class="card text-white bg-${cardColor} mb-3" style="max-width: 18rem;">
  <div class="card-header">${cardDate}</div>
  <div class="card-body">
    <h5 class="card-title">${cardTask}</h5>
    <p class="card-text">${cardDesc}</p>
  </div>
  <button type="button" onclick="handleDeleteTask(this)" class="btn btn-danger">
  Delete</button></div>`;
  if (cardStatus === 1) {
    eleParent = $("#todo-cards");
  } else if (cardStatus === 2) {
    eleParent = $("#to-dos");
  } else {
    eleParent = $("#to-dos");
  }
  const $card = $(eleCard);
  eleParent.append($card);
  $(document).ready(function () {
    $card.draggable();
  });
  console.log($card);
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  let arrTasks = JSON.parse(localStorage.getItem("taskInfo")) || [];
  // createTaskCard(arrTasks);
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  let arrTasks = JSON.parse(localStorage.getItem("taskInfo")) || [];
  const currTask = arrTasks.length - 1;
  const varDesc = inputDesc.val().trim();
  const varDate = inputDate.val().trim();
  const varTask = inputTask.val().trim();

  // use the length of the array as the taskID
  let varID = generateTaskId(arrTasks);
  // send our values for form validation
  if (!inputValidationHandler(varTask, varDate, varDesc)) {
    return;
  }
  const objTask = {
    TaskID: varID,
    Description: varDesc,
    Date: varDate,
    Task: varTask,
    Status: 1, // we will use status 1, 2, 3 to indicate wheter in todo, inprogress, done
  };
  // push the objTask for this form to the end of the arrTasks array
  arrTasks.push(objTask);
  // set the task info as the stringified verson of the array by using JSON
  localStorage.setItem("taskInfo", JSON.stringify(arrTasks));
  // handle modal form cleanup and hide it
  formCleanup();
  createTaskCard(arrTasks[currTask]);
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(btn) {
  btn.parentNode.remove();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // add eventlistener for click on the btnTaskAccept button, call createTaskCard function, pass list of Tasks
  btnTaskAccept.on("click", function (event) {
    handleAddTask(event);
  });
});
