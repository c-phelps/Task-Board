// CPhelps JS to work with our task board elements
const inputDesc = $("#taskDescription");
const inputDate = $("#dateInput");
const inputTask = $("#taskInput");

// simple function to create and append divs as alerts
function createAppendAlert(inStr) {
  const eleForm = $("#modal-form");
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
  const eleModal = $("#formModal");
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
    // if the previousTaskID was higher than or equal to the length (ie some tasks were deleted) then add to the previousTask
    if (varPrevTask >= varLength) {
      return varPrevTask + 1;
    }
    // if that is not the case, add to the length of the array
    return varLength;
  }
}

// very simple color changer function to determine the background color for the card
function colorChanger(task) {
  // for first run or if there are no current tasks, return to avoid erring out
  if (typeof task === "undefined") {
    return;
  }
  // set today and the task date
  const today = dayjs();
  const taskDate = dayjs(task.Date);

  // if the task is overdue, danger background - red
  if (taskDate.isBefore(today)) {
    return "danger";
  }
  // if the task is within 2 days get the warning color - yellow
  if (taskDate.diff(today, "day") <= 2) {
    return "warning";
  }
  // else return light as background
  return "light";
}

// Todo: create a function to create a task card
// accept the object using destructuring to directly pass the values
function createTaskCard({ Task, Date, Description, Status, TaskID }) {
  // pass object values to the color chaner function to determine the background color
  const cardColor = colorChanger({ Task, Date, Description, Status });
  // if card color is light set text to dark else white
  const cardText = cardColor === "light" ? "dark" : "white";
  // get the date and format it
  const dateFormatted = dayjs(Date).format("MMM D, YYYY");
  // set the template string with our variables to have a unique id
  // dynamic text color backround color, task name, date and description
  const eleCard = `
  <div id= "${TaskID}" class="cstm-card-style card text-${cardText} bg-${cardColor} mb-3 task-card" style="max-width: 18rem;">
  <div class="card-header" style="font-weight: bold; font-size: 130%">${Task}</div>
  <div class="card-body">
    <p class="card-title">${dateFormatted}</p>
    <p class="card-text">${Description}</p>
  </div> 
  <button type="button" id="card-${TaskID}" onclick="handleDeleteTask(this)" 
  class="btn btn-danger cstm-btn-style">Delete</button></div>`;
  // the parent is determined by the card's status, either todo 1, inprogress 2 or done 3
  const eleParent =
    Status === 1
      ? $("#todo-cards")
      : Status === 2
      ? $("#in-progress-cards")
      : $("#done-cards");
  // set the card object = the tempalte string element we created
  const $card = $(eleCard);
  // append our card element to the parent
  eleParent.append($card);
  // wait for the page to load
  $(document).ready(function () {
    //  make card draggable with some properties for handling how it can be dropped
    $card.draggable({
      snap: ".card-body",
      snapMode: "inner",
      snapTolerance: 20,
      revert: "invalid",
    });
  });
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  // grab our array of objects from local storage or initialize and empty array
  let arrTasks = JSON.parse(localStorage.getItem("taskInfo")) || [];
  // for each object send the value to the createTaskCard function so it can be created and displayed
  for (let i = 0; i < arrTasks.length; i++) {
    createTaskCard(arrTasks[i]);
  }
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  // grab the array of objects from local storage or an empty array
  let arrTasks = JSON.parse(localStorage.getItem("taskInfo")) || [];
  const currTask = arrTasks.length;
  const varDesc = inputDesc.val().trim();
  const varDate = inputDate.val().trim();
  const varTask = inputTask.val().trim();

  // use the length of the array as the taskID
  let varID = generateTaskId(arrTasks);
  // send our values for form validation
  if (!inputValidationHandler(varTask, varDate, varDesc)) {
    return;
  }
  // set our temp task object
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
  // grab the array of objects from local storage or an empty array
  let arrTasks = JSON.parse(localStorage.getItem("taskInfo")) || [];
  // the taskID is stored in the buttonID after a dash, use string split function to store the taskID
  // in the 1 index of the returned array and parse it to an int for strict comparison
  const varTaskID = parseInt(btn.id.split("-")[1]);

  // set our filtered to be full of all tasks where the taskID isnt = to our ID passed by the button
  const filteredArray = arrTasks.filter((element) => {
    return element.TaskID !== varTaskID;
  });

  // return our filtered array to local storage via JSON
  localStorage.setItem("taskInfo", JSON.stringify(filteredArray));
  // remove the parent object of the button from the page after it has been handled
  btn.parentNode.remove();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  event.preventDefault();
  // grab the array of objects from local storage or an empty array
  let arrTasks = JSON.parse(localStorage.getItem("taskInfo")) || [];
  // grab the id from the target's parent
  const eleTargetState = event.target.parentNode.id;
  // grab the id from the draggable card
  const eleDraggedId = parseInt($(ui.helper).attr("id"));
  // set the status based on the target's id if todo then 1, inprogress then 2 else 3
  const taskStatus =
    eleTargetState === "to-do" ? 1 : eleTargetState === "in-progress" ? 2 : 3;

  // use array map to search array for objects where task.taskID =  the dragged id
  let updatedTasks = $.map(arrTasks, function (task) {
    if (task.TaskID === eleDraggedId) {
      // update the status to the desired status
      task.Status = taskStatus;
    }
    // return the updated array to updatedTasks
    return task;
  });
  // set the array of objects = updated tasks array
  localStorage.setItem("taskInfo", JSON.stringify(updatedTasks));
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  const eleDropZone = $(".card-body");
  const btnTaskAccept = $("#btnTaskAccept");

  renderTaskList();
  // add eventlistener for click on the btnTaskAccept button
  btnTaskAccept.on("click", function (event) {
    handleAddTask(event);
  });
  // make the drop zone droppable with some properties like green background when hovering an object and make it accept our custom cards
  eleDropZone.droppable({
    accept: ".cstm-card-style",
    classes: {
      "ui-droppable-hover": "ui-state-hover",
    },
    drop: function (event, ui) {
      handleDrop(event, ui);
    },
  });
  $(function () {
    $("#dateInput").datepicker({
      changeMonth: true,
      changeYear: true,
    });
  });
});
