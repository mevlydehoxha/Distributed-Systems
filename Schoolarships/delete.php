<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
<?php
include 'functions.php';
$pdo = pdo_connect_mysql();
$msg = '';
// Check that the contact ID exists
if (isset($_GET['id'])) {
    // Select the record that is going to be deleted
    $stmt = $pdo->prepare('SELECT * FROM students_table WHERE id = ?');
    $stmt->execute([$_GET['id']]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$student) {
        exit('Contact doesn\'t exist with that ID!');
    }
    // Make sure the user confirms beore deletion
    if (isset($_GET['confirm'])) {
        if ($_GET['confirm'] == 'yes') {
            // User clicked the "Yes" button, delete record
            $stmt = $pdo->prepare('DELETE FROM students_table WHERE id = ?');
            $stmt->execute([$_GET['id']]);
            $msg = 'You have deleted the contact!';
        } else {
            // User clicked the "No" button, redirect them back to the read page
            header('Location: read.php');
            exit;
        }
    }
} else {
    exit('No ID specified!');
}
?>
<!-- <?=template_header('Delete')?>

<div class="content delete">
	<h2>Delete Contact #<?=$student['id']?></h2>
    <?php if ($msg): ?>
    <p><?=$msg?></p>
    <?php else: ?>
	<p>Are you sure you want to delete contact #<?=$student['id']?>?</p>
    <div class="yesno">
        <a href="delete.php?id=<?=$student['id']?>&confirm=yes">Yes</a>
        <a href="delete.php?id=<?=$student['id']?>&confirm=no">No</a>
    </div>
    <?php endif; ?>
</div>

<?=template_footer()?> -->

<main class="bg-gray-200 relative sm:w-full md:max-w-md lg:max-w-full mx-auto p-8 md:p-3 -my-8  shadow-2xl">
        <section class="">
            <h3 class="font-bold text-4xl relative ml-96 mt-16">Delete students</h3>
            <a href="read.php"><button class="bg-black hover:bg-gray-900 text-white w-1/5 h-10 rounded-lg relative bottom-20 focus:outline-none">List all students</button></a>
        </section>
        <hr>
        <h2 class="font-bold text-xl relative ml-96 mt-16"> Are you sure you want to delete this student?   <?=$student['id']," ",$student['first_name']," ",$student['last_name']?></h2>
       
            <?php if ($msg): ?>
            <p><?=$msg?></p>
            <?php endif; ?>
        <a href="delete.php?id=<?=$student['id']?>&confirm=yes"><button class="bg-red-700 hover:bg-red-400 text-white w-1/5 h-10 rounded-lg relative bottom-20 focus:outline-none">Yes</button></a>
        <a href="delete.php?id=<?=$student['id']?>&confirm=no"><button class="bg-gray-300 hover:bg-gray-600 text-black w-1/5 h-10 rounded-lg relative bottom-20 focus:outline-none">No</button></a>
  
  
    </main>
